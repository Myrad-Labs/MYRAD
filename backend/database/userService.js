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
      'SELECT id, privy_id, email, wallet_address, username, streak, last_contribution_date, total_points, league, created_at, updated_at, last_active_at, referred_by FROM users WHERE privy_id = $1',
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
 * Get user by verified email address
 * Used for email-based reconciliation during Privy App ID migration
 */
export async function getUserByEmail(email) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return null;
  }

  if (!email) {
    return null;
  }

  try {
    const result = await query(
      'SELECT id, privy_id, email, wallet_address, username, streak, last_contribution_date, total_points, league, created_at, updated_at, last_active_at, referred_by FROM users WHERE LOWER(email) = LOWER($1)',
      [String(email)]
    );

    if (result.rows.length === 0) {
      return null;
    }

    if (result.rows.length > 1) {
      console.error(`⚠️ WARNING: Multiple users found with email ${email}! Using first match.`);
    }

    return formatUser(result.rows[0]);
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Get user by wallet address
 * Used as fallback reconciliation for wallet-only users during Privy App ID migration
 */
export async function getUserByWallet(walletAddress) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    return null;
  }

  if (!walletAddress) {
    return null;
  }

  try {
    const result = await query(
      'SELECT id, privy_id, email, wallet_address, username, streak, last_contribution_date, total_points, league, created_at, updated_at, last_active_at, referred_by FROM users WHERE LOWER(wallet_address) = LOWER($1)',
      [String(walletAddress)]
    );

    if (result.rows.length === 0) {
      return null;
    }

    if (result.rows.length > 1) {
      console.error(`⚠️ WARNING: Multiple users found with wallet ${walletAddress}! Using first match.`);
    }

    return formatUser(result.rows[0]);
  } catch (error) {
    console.error('Error getting user by wallet:', error);
    return null;
  }
}

/**
 * Reconcile an existing user during Privy App ID migration
 * Updates privy_id and wallet_address, logs the change in wallet_history
 * 
 * @param {string} userId - Internal user ID
 * @param {string} newPrivyId - New Privy ID from the new App ID
 * @param {string} newWalletAddress - New wallet from the new App ID
 * @param {string} oldPrivyId - Old Privy ID being replaced
 * @param {string} oldWalletAddress - Old wallet being replaced
 * @returns {object} Updated user
 */
export async function reconcileUser(userId, newPrivyId, newWalletAddress, oldPrivyId, oldWalletAddress) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    throw new Error('Database is required but not configured');
  }

  await query('BEGIN');

  try {
    // Lock the user row to prevent concurrent updates
    await query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [userId]);

    // Log the wallet change in audit table (if it exists)
    try {
      const historyId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      await query(
        `INSERT INTO wallet_history (id, user_id, old_wallet_address, new_wallet_address, old_privy_id, new_privy_id, migration_reason, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [historyId, userId, oldWalletAddress || null, newWalletAddress || null, oldPrivyId || null, newPrivyId, 'privy_app_id_switch']
      );
    } catch (historyError) {
      // wallet_history table may not exist yet on production — log and continue
      console.warn(`⚠️ Could not log wallet change to wallet_history (table may not exist): ${historyError.message}`);
    }

    // Update the user record with new privy_id and wallet_address
    await query(
      `UPDATE users 
       SET privy_id = $1, 
           wallet_address = COALESCE($2, wallet_address),
           updated_at = NOW(), 
           last_active_at = NOW() 
       WHERE id = $3`,
      [String(newPrivyId), newWalletAddress || null, userId]
    );

    // Also update wallet_address in referrals table so referral system stays consistent
    if (newWalletAddress && oldWalletAddress && newWalletAddress !== oldWalletAddress) {
      await query(
        `UPDATE referrals SET wallet_address = $1 WHERE user_id = $2`,
        [newWalletAddress, userId]
      );
      console.log(`🔄 Referrals wallet updated for user ${userId}: ${oldWalletAddress.slice(0, 10)}... → ${newWalletAddress.slice(0, 10)}...`);

      // Update referred_by in users table where referred_by = old wallet
      // This ensures the scheduler can still match referees to their referrer
      await query(
        `UPDATE users SET referred_by = $1 WHERE referred_by = $2`,
        [newWalletAddress, oldWalletAddress]
      );
      console.log(`🔄 referred_by references updated: ${oldWalletAddress.slice(0, 10)}... → ${newWalletAddress.slice(0, 10)}...`);
    }

    await query('COMMIT');

    const updatedUser = await getUserById(userId);
    console.log(`🔄 User reconciled: id=${userId}, oldPrivyId=${oldPrivyId}, newPrivyId=${newPrivyId}, oldWallet=${oldWalletAddress ? oldWalletAddress.slice(0, 10) + '...' : 'null'}, newWallet=${newWalletAddress ? newWalletAddress.slice(0, 10) + '...' : 'null'}`);
    
    return updatedUser;
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error reconciling user:', error);
    throw error;
  }
}

/**
 * Reconcile or create a user during auth verification
 * Handles the Privy App ID migration:
 *   1. Check by privy_id (same App ID, fast path)
 *   2. Check by email (returning user with new App ID)
 *   3. Create new user (genuinely new user)
 * 
 * @param {string} privyId - Privy user ID from current App ID
 * @param {string} email - Verified email address
 * @param {string} walletAddress - Wallet address from current App ID
 * @returns {{ user: object, isNewUser: boolean, wasMigrated: boolean }}
 */
export async function reconcileOrCreateUser(privyId, email, walletAddress) {
  if (!config.DB_USE_DATABASE || !config.DATABASE_URL) {
    throw new Error('Database is required but not configured');
  }

  if (!privyId) {
    throw new Error('privyId is required');
  }

  // === STEP 1: Check by Privy ID (fast path — same App ID user) ===
  const existingByPrivyId = await getUserByPrivyId(privyId);
  if (existingByPrivyId) {
    console.log(`✅ User found by privyId: id=${existingByPrivyId.id}`);
    return { user: existingByPrivyId, isNewUser: false, wasMigrated: false };
  }

  // === STEP 2: Check by email (returning user — Privy App ID switched) ===
  if (email) {
    const existingByEmail = await getUserByEmail(email);
    if (existingByEmail) {
      console.log(`🔄 MIGRATION: User found by email (${email}), reconciling privy_id and wallet...`);
      console.log(`   Old privyId: ${existingByEmail.privyId}`);
      console.log(`   New privyId: ${privyId}`);
      console.log(`   Old wallet: ${existingByEmail.walletAddress || 'null'}`);
      console.log(`   New wallet: ${walletAddress || 'null'}`);

      const reconciled = await reconcileUser(
        existingByEmail.id,
        privyId,
        walletAddress,
        existingByEmail.privyId,
        existingByEmail.walletAddress
      );

      return { user: reconciled, isNewUser: false, wasMigrated: true };
    }
  }

  // === STEP 2b: Check by wallet address (wallet-only users — no email available) ===
  if (walletAddress) {
    const existingByWallet = await getUserByWallet(walletAddress);
    if (existingByWallet) {
      console.log(`🔄 MIGRATION (wallet): User found by wallet (${walletAddress.slice(0, 10)}...), reconciling privy_id...`);
      console.log(`   Old privyId: ${existingByWallet.privyId}`);
      console.log(`   New privyId: ${privyId}`);

      // For wallet-only users the wallet stays the same — only privy_id changes
      const reconciled = await reconcileUser(
        existingByWallet.id,
        privyId,
        walletAddress,           // same wallet
        existingByWallet.privyId,
        existingByWallet.walletAddress
      );

      return { user: reconciled, isNewUser: false, wasMigrated: true };
    }
  }

  // === STEP 3: Genuinely new user — create fresh account ===
  console.log(`🆕 No existing user found by privyId, email, or wallet. Creating new user.`);
  const result = await createUser(privyId, email, walletAddress);
  return { user: result.user, isNewUser: result.isNewUser, wasMigrated: false };
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
      'SELECT id, privy_id, email, wallet_address, username, streak, last_contribution_date, total_points, league, created_at, updated_at, last_active_at, referred_by FROM users WHERE id = $1',
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

  const generateUniqueId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${random}`;
  };

  await query('BEGIN');

  try {
    // 🔥 Check if user already exists
    const existing = await getUserByPrivyId(privyId);
    if (existing) {
      await query('ROLLBACK');
      console.log(`ℹ️ User with privyId ${privyId} already exists`);
      return { user: existing, isNewUser: false };
    }

    const userId = generateUniqueId();
    const now = new Date();

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
        String(privyId),
        email || null,
        walletAddress || null,
        null,
        0,
        null,
        0,
        'Bronze',
        now,
        now
      ]
    );

    const insertedUser = result.rows[0];
    const finalUserId = insertedUser.id;

    // 🔥 Check if first access bonus already exists
    const pointsCheck = await query(
      'SELECT COUNT(*) as count FROM points_history WHERE user_id = $1 AND reason = $2',
      [finalUserId, 'first_access_bonus']
    );

    const hasInitialPoints = parseInt(pointsCheck.rows[0].count, 10) > 0;

    if (!hasInitialPoints) {
      try {
        const pointsId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

        await query(
          'INSERT INTO points_history (id, user_id, points, reason, created_at) VALUES ($1, $2, $3, $4, NOW())',
          [pointsId, finalUserId, 10, 'first_access_bonus']
        );

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
        console.log(`ℹ️ Points may already exist for user ${finalUserId}, continuing...`);
      }
    }

    await query('COMMIT');

    const user = await getUserById(finalUserId);

    console.log(`✅ New user created: id=${user.id}`);
    return { user, isNewUser: true };

  } catch (error) {
    await query('ROLLBACK');

    // If it's a unique constraint violation, try to get the existing user
    if (
      error.code === '23505' ||
      error.message.includes('unique constraint') ||
      error.message.includes('duplicate key')
    ) {
      console.log(`⚠️ Race condition detected for privyId ${privyId}, fetching existing user...`);
      const existing = await getUserByPrivyId(privyId);
      if (existing) {
        return { user: existing, isNewUser: false };
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
    let queryText = 'SELECT id, privy_id, email, wallet_address, username, streak, last_contribution_date, total_points, league, created_at, updated_at, last_active_at, referred_by FROM users ORDER BY total_points DESC, created_at ASC';
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
        const userLock = await query(
          'SELECT id, total_points, referred_by FROM users WHERE id = $1 FOR UPDATE',
          [userId]
        );

        if (userLock.rows.length === 0) {
          throw new Error(`User ${userId} not found`);
        }

        const oldTotalPoints = parseInt(userLock.rows[0].total_points || 0, 10);
        const referredBy = userLock.rows[0].referred_by;

        // Insert points transaction with unique ID
        const pointsId = generateUniqueId();
        await query(
          'INSERT INTO points_history (id, user_id, points, reason, created_at) VALUES ($1, $2, $3, $4, NOW())',
          [pointsId, userId, points, reason]
        );

        // Increment total_points directly instead of recalculating SUM from full history
        await query(
          'UPDATE users SET total_points = total_points + $1, updated_at = NOW() WHERE id = $2',
          [points, userId]
        );

        // Fetch updated total to calculate league
        const totalResult = await query(
          'SELECT total_points FROM users WHERE id = $1',
          [userId]
        );
        const totalPoints = parseInt(totalResult.rows[0].total_points, 10);
        const league = calculateLeague(totalPoints);

        // Only update league if it changed
        await query(
          'UPDATE users SET league = $1 WHERE id = $2 AND league != $1',
          [league, userId]
        );

        // Check if user just reached 70 points and has a referrer - increment successful_ref
        if (oldTotalPoints < 70 && totalPoints >= 70 && referredBy) {
          try {
            await query(
              'UPDATE referrals SET successful_ref = successful_ref + 1 WHERE referral_code = $1',
              [referredBy]
            );
            console.log(`✅ User ${userId} reached 70 points - incremented successful_ref for referrer ${referredBy}`);
          } catch (refError) {
            // Log but don't fail the transaction if referral update fails
            console.error(`⚠️ Failed to increment successful_ref for referrer ${referredBy}:`, refError);
          }
        }

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
    lastActiveAt: row.last_active_at,
    referredBy: row.referred_by || null
  };
}

