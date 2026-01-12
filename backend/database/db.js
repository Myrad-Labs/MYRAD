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
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased to 10s for cloud databases
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    console.log('✅ PostgreSQL connection pool created');
  }
  return pool;
}

/**
 * Execute a query with error handling
 */
export async function query(text, params) {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database connection not configured. Set DATABASE_URL environment variable.');
  }

  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.log('⚠️ Slow query detected:', { text: text.substring(0, 100), duration });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', { text: text.substring(0, 100), error: error.message });
    throw error;
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






















