// Database service for users and points
// Handles user management and points transactions

import { query } from './db.js';
import config from '../config.js';
import { calculateLeague } from '../rewardService.js';

/**
 * Get user by Privy ID
 */
export async function getUserByPrivyId(privyId) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return null;
  }

  if (!privyId) {
    console.warn('⚠️ getUserByPrivyId called with null/undefined privyId');
    return null;
  }

  try {
    const result = await query(
      'SELECT * FROM users WHERE privy_id = $1',
      [String(privyId)] // Ensure it's a string
    );

    if (result.rows.length === 0) {
      return null;
    }

    // If multiple users found (shouldn't happen due to UNIQUE constraint, but log it)
    if (result.rows.length > 1) {
      console.error(`⚠️ WARNING: Multiple users found with privyId ${privyId}! This should not happen.`);
    }

    return formatUser(result.rows[0]);
  } catch (error) {
    console.error('Error getting user by Privy ID:', error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return null;
  }

  try {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return formatUser(result.rows[0]);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(privyId, email, walletAddress = null) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    throw new Error('Database is required but not configured');
  }

  if (!privyId) {
    throw new Error('privyId is required to create user');
  }

  // Generate unique userId: timestamp + random component to prevent collisions
  // Format: timestamp_randomHex (e.g., "1704067200000_a3f2b1")
  const generateUniqueId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8); // 6 char random string
    return `${timestamp}_${random}`;
  };

  // Use transaction to ensure atomicity
  await query('BEGIN');

  try {
    // First, check if user exists (within transaction to prevent race conditions)
    const existing = await getUserByPrivyId(privyId);
    if (existing) {
      await query('ROLLBACK');
      console.log(`ℹ️ User with privyId ${privyId} already exists, returning existing user`);
      return existing;
    }

    const userId = generateUniqueId();
    const now = new Date();

    // Use ON CONFLICT to handle race conditions at database level
    // If privy_id already exists (due to race condition), return existing user
    const result = await query(
      `INSERT INTO users (
        id, privy_id, email, wallet_address, username, streak,
        last_contribution_date, total_points, league, created_at, last_active_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (privy_id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, users.email),
        wallet_address = COALESCE(EXCLUDED.wallet_address, users.wallet_address),
        last_active_at = EXCLUDED.last_active_at
      RETURNING *`,
      [
        userId,
        String(privyId), // Ensure privyId is a string
        email || null, // Explicitly set to null if not provided
        walletAddress || null, // Explicitly set to null if not provided
        null, // username
        0, // streak
        null, // last_contribution_date
        0, // total_points (will be updated when points are awarded)
        'Bronze',
        now,
        now
      ]
    );

    const insertedUser = result.rows[0];
    const finalUserId = insertedUser.id;

    // Check if this was an insert or update (by checking if points_history exists)
    const pointsCheck = await query(
      'SELECT COUNT(*) as count FROM points_history WHERE user_id = $1 AND reason = $2',
      [finalUserId, 'first_access_bonus']
    );

    const hasInitialPoints = parseInt(pointsCheck.rows[0].count, 10) > 0;

    // Only award points if this was a new user (not an update due to conflict)
    // Add points within the same transaction
    if (!hasInitialPoints) {
      try {
        const pointsId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        await query(
          'INSERT INTO points_history (id, user_id, points, reason, created_at) VALUES ($1, $2, $3, $4, NOW())',
          [pointsId, finalUserId, 10, 'first_access_bonus']
        );

        // Recalculate and update user's total points within transaction
        const totalResult = await query(
          'SELECT COALESCE(SUM(points), 0) as total FROM points_history WHERE user_id = $1',
          [finalUserId]
        );

        const totalPoints = parseInt(totalResult.rows[0].total, 10);
        const league = calculateLeague(totalPoints);

        await query(
          'UPDATE users SET total_points = $1, league = $2, updated_at = NOW() WHERE id = $3',
          [totalPoints, league, finalUserId]
        );
      } catch (pointsError) {
        // If points already exist, that's okay (race condition handled)
        console.log(`ℹ️ Points may already exist for user ${finalUserId}, continuing...`);
      }
    }

    await query('COMMIT');

    const user = await getUserById(finalUserId);
    console.log(`✅ User created/retrieved: id=${user.id}, privyId=${privyId}, email=${email || 'null'}, wallet=${walletAddress ? walletAddress.slice(0, 10) + '...' : 'null'}`);
    return user;
  } catch (error) {
    await query('ROLLBACK');
    
    // If it's a unique constraint violation, try to get the existing user
    if (error.code === '23505' || error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
      console.log(`⚠️ Race condition detected for privyId ${privyId}, fetching existing user...`);
      const existing = await getUserByPrivyId(privyId);
      if (existing) {
        return existing;
      }
    }
    
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update user wallet address
 */
export async function updateUserWallet(userId, walletAddress) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return null;
  }

  try {
    await query(
      'UPDATE users SET wallet_address = $1, updated_at = NOW() WHERE id = $2',
      [walletAddress, userId]
    );

    return await getUserById(userId);
  } catch (error) {
    console.error('Error updating user wallet:', error);
    return null;
  }
}

/**
 * Update user activity (last_active_at)
 */
export async function updateUserActivity(userId) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return;
  }

  try {
    await query(
      'UPDATE users SET last_active_at = NOW(), updated_at = NOW() WHERE id = $1',
      [userId]
    );
  } catch (error) {
    console.error('Error updating user activity:', error);
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId, updates) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return null;
  }

  try {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Map updates to database column names
    const fieldMapping = {
      username: 'username',
      email: 'email',
      streak: 'streak',
      lastContributionDate: 'last_contribution_date',
      totalPoints: 'total_points',
      league: 'league',
      lastActiveAt: 'last_active_at'
    };

    for (const [key, value] of Object.entries(updates)) {
      const dbField = fieldMapping[key];
      if (dbField) {
        fields.push(`${dbField} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return await getUserById(userId);
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    return await getUserById(userId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return true;
  }

  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    return parseInt(result.rows[0].count, 10) === 0;
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
}

/**
 * Get all users (for leaderboard)
 * @param {number} limit - Maximum number of users to return (optional, returns all if not specified)
 */
export async function getAllUsers(limit = null) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return [];
  }

  try {
    let queryText = 'SELECT * FROM users ORDER BY total_points DESC, created_at ASC';
    if (limit && limit > 0) {
      queryText += ` LIMIT ${parseInt(limit, 10)}`;
    }
    
    const result = await query(queryText);

    return result.rows.map(formatUser);
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

/**
 * Add points to user (transaction)
 */
export async function addPoints(userId, points, reason) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    throw new Error('Database is required but not configured');
  }

  // Generate unique ID with timestamp + random component
  const generateUniqueId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${random}`;
  };

  // Retry logic for handling concurrent transactions
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Start transaction with SERIALIZABLE isolation for strongest consistency
      await query('BEGIN');

      try {
        // Lock the user row to prevent concurrent points updates
        await query(
          'SELECT id FROM users WHERE id = $1 FOR UPDATE',
          [userId]
        );

        // Insert points transaction with unique ID
        const pointsId = generateUniqueId();
        await query(
          'INSERT INTO points_history (id, user_id, points, reason, created_at) VALUES ($1, $2, $3, $4, NOW())',
          [pointsId, userId, points, reason]
        );

        // Recalculate and update user's total points
        const totalResult = await query(
          'SELECT COALESCE(SUM(points), 0) as total FROM points_history WHERE user_id = $1',
          [userId]
        );

        const totalPoints = parseInt(totalResult.rows[0].total, 10);
        const league = calculateLeague(totalPoints);

        await query(
          'UPDATE users SET total_points = $1, league = $2, updated_at = NOW() WHERE id = $3',
          [totalPoints, league, userId]
        );

        await query('COMMIT');

        return {
          id: pointsId,
          userId,
          points,
          reason,
          createdAt: new Date().toISOString()
        };
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      lastError = error;
      
      // Check if it's a serialization failure or deadlock - these are retryable
      if (error.code === '40001' || error.code === '40P01' || error.message.includes('deadlock') || error.message.includes('could not serialize')) {
        console.log(`⚠️ Transaction conflict in addPoints (attempt ${attempt}/${maxRetries}), retrying...`);
        // Small random delay before retry to reduce collision chance
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        continue;
      }
      
      // Non-retryable error
      throw error;
    }
  }

  console.error('Error adding points after retries:', lastError);
  throw lastError;
}

/**
 * Get user's points history
 */
export async function getUserPoints(userId) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return [];
  }

  try {
    const result = await query(
      'SELECT * FROM points_history WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      points: row.points,
      reason: row.reason,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error('Error getting user points:', error);
    return [];
  }
}

/**
 * Get user's total points
 * Reads from users.total_points column (source of truth) instead of calculating from points_history
 * This ensures consistency with leaderboard and respects manual DB changes
 */
export async function getUserTotalPoints(userId) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return 0;
  }

  try {
    // Read directly from users table (source of truth)
    // This matches how leaderboard reads points and respects manual DB changes
    const result = await query(
      'SELECT total_points FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return 0;
    }

    return parseInt(result.rows[0].total_points || 0, 10);
  } catch (error) {
    console.error('Error getting user total points:', error);
    // Fallback to calculating from points_history if users table read fails
    try {
      const fallbackResult = await query(
        'SELECT COALESCE(SUM(points), 0) as total FROM points_history WHERE user_id = $1',
        [userId]
      );
      return parseInt(fallbackResult.rows[0].total, 10);
    } catch (fallbackError) {
      console.error('Error in fallback points calculation:', fallbackError);
      return 0;
    }
  }
}

/**
 * Get weekly leaderboard
 */
export async function getWeeklyLeaderboard(limit = 10) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return [];
  }

  try {
    const { query } = await import('./db.js');
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const result = await query(
      `SELECT 
          u.id, u.username, u.email, u.wallet_address, u.total_points, u.league, u.last_contribution_date,
          COALESCE(SUM(ph.points), 0) as weekly_points
      FROM users u
      LEFT JOIN points_history ph ON u.id = ph.user_id AND ph.created_at > $1
      GROUP BY u.id, u.username, u.email, u.wallet_address, u.total_points, u.league, u.last_contribution_date
      HAVING COALESCE(SUM(ph.points), 0) > 0
      ORDER BY weekly_points DESC
      LIMIT $2`,
      [oneWeekAgo, limit]
    );

    return result.rows.map(row => ({
      id: row.id,
      username: row.username || `User ${row.id.substr(-4)}`,
      email: row.email || null,
      walletAddress: row.wallet_address || null,
      weeklyPoints: parseInt(row.weekly_points, 10),
      totalPoints: row.total_points || 0,
      league: row.league || 'Bronze',
      lastContributionDate: row.last_contribution_date || null
    }));
  } catch (error) {
    console.error('Error getting weekly leaderboard:', error);
    return [];
  }
}

/**
 * Format user object from database row
 */
function formatUser(row) {
  return {
    id: row.id,
    privyId: row.privy_id,
    email: row.email,
    walletAddress: row.wallet_address,
    username: row.username,
    streak: row.streak || 0,
    lastContributionDate: row.last_contribution_date,
    totalPoints: row.total_points || 0,
    league: row.league || 'Bronze',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastActiveAt: row.last_active_at
  };
}

