// Backfill script to populate movies_watched and top_series from sellable_data
// Run this after migration 005 to update existing rows

import { query, testConnection, closePool } from './db.js';

async function backfillNetflixContent() {
  console.log('🔄 Starting backfill of movies_watched and top_series from sellable_data...');
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Cannot connect to database. Please check DATABASE_URL.');
    process.exit(1);
  }

  try {
    // Get all Netflix contributions
    const result = await query(`
      SELECT id, sellable_data 
      FROM netflix_contributions
      WHERE sellable_data IS NOT NULL
    `);

    console.log(`📊 Found ${result.rows.length} Netflix contributions to update`);

    let updated = 0;
    let skipped = 0;

    for (const row of result.rows) {
      try {
        const sellableData = row.sellable_data;
        const moviesWatched = sellableData?.content_catalog?.movies_watched || null;
        const topSeries = sellableData?.content_catalog?.top_series || null;

        // Update the row with extracted data
        await query(
          `UPDATE netflix_contributions 
           SET movies_watched = $1, 
               top_series = $2
           WHERE id = $3`,
          [
            moviesWatched ? JSON.stringify(moviesWatched) : null,
            topSeries ? JSON.stringify(topSeries) : null,
            row.id
          ]
        );

        updated++;
        if (updated % 10 === 0) {
          console.log(`  ✅ Updated ${updated} contributions...`);
        }
      } catch (error) {
        console.error(`  ❌ Error updating contribution ${row.id}:`, error.message);
        skipped++;
      }
    }

    console.log('\n✅ Backfill completed!');
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);

  } catch (error) {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  backfillNetflixContent();
}

export { backfillNetflixContent };


















