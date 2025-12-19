// Quick script to create netflix_contributions table
import pg from 'pg';

const connectionString = process.env.DATABASE_URL?.replace(/&?channel_binding=require/g, '')
    || 'postgresql://neondb_owner:npg_8qKpkMYdQn3P@ep-divine-lab-adl0q2nq-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
});

const sql = `
CREATE TABLE IF NOT EXISTS netflix_contributions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    reclaim_proof_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'verified',
    processing_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sellable_data JSONB,
    metadata JSONB,
    total_titles_watched INTEGER,
    total_watch_hours DECIMAL(10, 2),
    binge_score INTEGER,
    engagement_tier VARCHAR(50),
    top_genres JSONB,
    genre_diversity_score INTEGER,
    dominant_content_type VARCHAR(50),
    primary_language VARCHAR(50),
    peak_viewing_day VARCHAR(20),
    peak_viewing_time VARCHAR(20),
    late_night_viewer BOOLEAN DEFAULT FALSE,
    is_binge_watcher BOOLEAN DEFAULT FALSE,
    day_of_week_distribution JSONB,
    time_of_day_curve JSONB,
    subscription_tier VARCHAR(50),
    account_age_years DECIMAL(5, 2),
    member_since_year INTEGER,
    loyalty_tier VARCHAR(50),
    churn_risk VARCHAR(20),
    kids_content_pct INTEGER,
    mature_content_pct INTEGER,
    primary_audience VARCHAR(50),
    segment_id VARCHAR(255),
    cohort_id VARCHAR(255),
    data_quality_score INTEGER
);
`;

async function run() {
    try {
        console.log('🔄 Creating netflix_contributions table...');
        await pool.query(sql);
        console.log('✅ netflix_contributions table created successfully!');

        // Create indexes
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_netflix_user_id ON netflix_contributions(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_netflix_created_at ON netflix_contributions(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_netflix_reclaim_proof_id ON netflix_contributions(reclaim_proof_id)',
        ];

        for (const idx of indexes) {
            try {
                await pool.query(idx);
            } catch (e) {
                // Ignore if exists
            }
        }
        console.log('✅ Indexes created!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

run();
