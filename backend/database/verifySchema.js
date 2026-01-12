// Script to verify database schema matches expected structure
import pg from 'pg';
import config from '../config.js';

const { Pool } = pg;

// Expected tables and their key columns
const EXPECTED_TABLES = {
  zomato_contributions: [
    'id', 'user_id', 'reclaim_proof_id', 'sellable_data', 'metadata',
    'total_orders', 'total_gmv', 'top_cuisines', 'top_brands'
  ],
  github_contributions: [
    'id', 'user_id', 'reclaim_proof_id', 'sellable_data', 'metadata',
    'follower_count', 'contribution_count', 'developer_tier'
  ],
  netflix_contributions: [
    'id', 'user_id', 'reclaim_proof_id', 'sellable_data', 'metadata',
    'total_titles_watched', 'total_watch_hours', 'movies_watched', 'top_series'
  ]
};

async function verifyDatabase() {
  console.log('🔍 Verifying database schema...\n');
  
  // Get database URL from environment variable (never hardcode credentials!)
  const currentDbUrl = config.DATABASE_URL || config.POSTGRES_URL;
  
  if (!currentDbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.error('   Please set DATABASE_URL in your .env file.');
    process.exit(1);
  }
  
  console.log(`📋 DATABASE_URL: ${currentDbUrl ? 'Set' : 'Not set'}`);
  if (currentDbUrl) {
    // Mask password in URL for display
    const masked = currentDbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`   ${masked}\n`);
  }
  
  // Create a connection using the environment variable
  let connectionString = currentDbUrl.replace(/&?channel_binding=require/g, '');
  const pool = new Pool({
    connectionString,
    ssl: connectionString?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  });

  try {
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log(`✅ Connected to database: ${new Date(result.rows[0].now).toISOString()}\n`);

    // Check if all expected tables exist
    console.log('📊 Checking tables...\n');
    
    for (const [tableName, expectedColumns] of Object.entries(EXPECTED_TABLES)) {
      try {
        // Check if table exists
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [tableName]);

        if (!tableCheck.rows[0].exists) {
          console.log(`❌ Table "${tableName}" does NOT exist`);
          continue;
        }

        console.log(`✅ Table "${tableName}" exists`);

        // Check columns
        const columnsResult = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);

        const existingColumns = columnsResult.rows.map(r => r.column_name);
        
        // Check if all expected columns exist
        const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col));
        if (missingColumns.length > 0) {
          console.log(`   ⚠️  Missing columns: ${missingColumns.join(', ')}`);
        } else {
          console.log(`   ✅ All expected columns present`);
        }

        // Count rows
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`   📈 Rows: ${countResult.rows[0].count}\n`);

      } catch (error) {
        console.log(`❌ Error checking table "${tableName}": ${error.message}\n`);
      }
    }

    // Verify netflix_contributions has movies_watched and top_series
    console.log('🎬 Verifying Netflix content catalog columns...\n');
    const netflixColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'netflix_contributions'
      AND column_name IN ('movies_watched', 'top_series')
    `);

    if (netflixColumns.rows.length === 2) {
      console.log('✅ movies_watched and top_series columns exist');
      netflixColumns.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });
    } else {
      console.log('❌ movies_watched and top_series columns are missing!');
      console.log('   Run: npm run db:migrate:netflix');
    }

    console.log('\n✅ Database verification complete!');

  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyDatabase();
}

export { verifyDatabase };

