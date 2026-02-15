// Script to set up all tables in production database
// Run this after updating DATABASE_URL to production URL
// Uses the existing migrate.js logic for each migration to ensure consistency
import { testConnection, closePool } from './db.js';
import { runMigrations } from './migrate.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All migrations in order
const MIGRATIONS = [
  '001_initial_schema.sql',
  '002_separate_zomato_github_tables.sql',
  '003_add_zomato_extended_fields.sql',
  '004_add_netflix_table.sql',
  '005_add_netflix_content_catalog.sql',
  '006_add_users_and_points_tables.sql',
  '007_add_wallet_address_to_contributions.sql',
  '008_add_blinkit_table.sql',
  '009_add_ubereats_table.sql',
  '010_add_uber_rides_table.sql',
  '011_add_strava_table.sql',
  '012_add_opt_out_column.sql',
  '013_add_zepto_table.sql',
  '014_add_composite_indexes.sql'
];

async function runMigration(migrationFile) {
  // Temporarily override process.argv to pass the migration file to runMigrations
  const originalArgv = process.argv;
  process.argv = [process.argv[0], process.argv[1], migrationFile];

  try {
    await runMigrations();
  } finally {
    // Restore original argv
    process.argv = originalArgv;
  }
}

async function setupProductionDatabase() {
  console.log('🚀 Setting up production database...\n');

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Cannot connect to database. Please check DATABASE_URL in your .env file.');
    console.error('   Make sure DATABASE_URL is set to your production NeonDB URL.');
    process.exit(1);
  }

  console.log('✅ Database connection successful!\n');

  try {
    for (let i = 0; i < MIGRATIONS.length; i++) {
      const migrationFile = MIGRATIONS[i];
      console.log(`\n📦 Running migration ${i + 1}/${MIGRATIONS.length}: ${migrationFile}...\n`);

      await runMigration(migrationFile);

      console.log(`\n✅ Migration ${i + 1} completed: ${migrationFile}`);
    }

    console.log('\n🎉 All migrations completed successfully!');
    console.log('\n📊 Database tables created:');
    console.log('   - zomato_contributions');
    console.log('   - github_contributions');
    console.log('   - netflix_contributions');
    console.log('   - blinkit_contributions');
    console.log('   - ubereats_contributions');
    console.log('   - uber_rides_contributions');
    console.log('   - strava_contributions');
    console.log('   - zepto_contributions');
    console.log('   - users');
    console.log('   - points_history');
    console.log('\n✅ Production database is ready!');

  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.includes(process.argv[1])) {
  setupProductionDatabase().catch(err => {
    console.error('Setup failed:', err);
    process.exit(1);
  });
}

export { setupProductionDatabase };
