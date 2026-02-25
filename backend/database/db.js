// Database connection module for PostgreSQL (Neon)
import pg from 'pg';
import config from '../config.js';

const { Pool } = pg;

let pool = null;

/**
 * Get or create database connection pool
 */
export function getPool() {
  if (!pool && config.DATABASE_URL && config.DB_USE_DATABASE) {
    // Remove channel_binding from connection string if present (not supported by pg library)
    let connectionString = config.DATABASE_URL.replace(/&?channel_binding=require/g, '');

    pool = new Pool({
      connectionString,
      ssl: connectionString?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
      max: 10, // Reduced pool size for serverless databases
      idleTimeoutMillis: 20000, // Close idle connections after 20s
      connectionTimeoutMillis: 30000, // 30s timeout for Neon cold starts
      statement_timeout: 30000, // 30s statement timeout
      query_timeout: 30000, // 30s query timeout
    });

    // Handle pool errors - recreate pool on fatal errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client:', err.message);
      // If connection was terminated, mark pool for recreation
      if (err.message.includes('terminated') || err.message.includes('timeout')) {
        console.log('🔄 Pool error detected, will recreate on next query');
        pool = null;
      }
    });

    console.log('✅ PostgreSQL connection pool created');
  }
  return pool;
}

/**
 * Execute a query with error handling and retry logic
 */
export async function query(text, params, retries = 2) {
  let currentPool = getPool();
  if (!currentPool) {
    throw new Error('Database connection not configured. Set DATABASE_URL environment variable.');
  }

  const start = Date.now();
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await currentPool.query(text, params);
      const duration = Date.now() - start;
      if (duration > 1000) {
        console.log('⚠️ Slow query detected:', { text: text.substring(0, 100), duration });
      }
      return res;
    } catch (error) {
      const isRetryable = 
        error.message.includes('timeout') || 
        error.message.includes('terminated') ||
        error.message.includes('Connection terminated') ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT';
      
      if (isRetryable && attempt < retries) {
        console.log(`⚠️ Database query failed (attempt ${attempt + 1}/${retries + 1}), retrying...`);
        // Reset pool on connection errors
        pool = null;
        currentPool = getPool();
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      
      console.error('Database query error:', { text: text.substring(0, 100), error: error.message });
      throw error;
    }
  }
}

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ Database connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Close database connection pool
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection pool closed');
  }
}

/**
 * Keep the database connection warm (call periodically)
 * This helps prevent Neon cold starts
 */
let keepAliveInterval = null;

export function startKeepAlive(intervalMs = 60000) {
  if (keepAliveInterval) return;
  
  keepAliveInterval = setInterval(async () => {
    try {
      const currentPool = getPool();
      if (currentPool) {
        await currentPool.query('SELECT 1');
      }
    } catch (error) {
      // Silently handle keepalive errors - pool will be recreated on next real query
      console.log('⚠️ Keepalive ping failed, pool will be refreshed');
      pool = null;
    }
  }, intervalMs);
  
  console.log(`🔄 Database keepalive started (every ${intervalMs / 1000}s)`);
}

export function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('🔄 Database keepalive stopped');
  }
}


























