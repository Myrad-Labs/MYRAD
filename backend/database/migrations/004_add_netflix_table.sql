-- Netflix Contributions Table for MYRAD
-- Stores streaming behavior intelligence data

CREATE TABLE IF NOT EXISTS netflix_contributions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    reclaim_proof_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'verified',
    processing_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Full sellable data as JSONB
    sellable_data JSONB,
    metadata JSONB,
    
    -- Indexed viewing metrics
    total_titles_watched INTEGER,
    total_watch_hours DECIMAL(10, 2),
    binge_score INTEGER,
    engagement_tier VARCHAR(50),
    
    -- Content preferences (indexed)
    top_genres JSONB,
    genre_diversity_score INTEGER,
    dominant_content_type VARCHAR(50),
    primary_language VARCHAR(50),
    
    -- Viewing behavior (indexed)
    peak_viewing_day VARCHAR(20),
    peak_viewing_time VARCHAR(20),
    late_night_viewer BOOLEAN DEFAULT FALSE,
    is_binge_watcher BOOLEAN DEFAULT FALSE,
    day_of_week_distribution JSONB,
    time_of_day_curve JSONB,
    
    -- Subscription data (indexed)
    subscription_tier VARCHAR(50),
    account_age_years DECIMAL(5, 2),
    member_since_year INTEGER,
    loyalty_tier VARCHAR(50),
    churn_risk VARCHAR(20),
    
    -- Maturity profile
    kids_content_pct INTEGER,
    mature_content_pct INTEGER,
    primary_audience VARCHAR(50),
    
    -- Segment and compliance
    segment_id VARCHAR(255),
    cohort_id VARCHAR(255),
    data_quality_score INTEGER
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_netflix_user_id ON netflix_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_netflix_created_at ON netflix_contributions(created_at);
CREATE INDEX IF NOT EXISTS idx_netflix_reclaim_proof_id ON netflix_contributions(reclaim_proof_id);
CREATE INDEX IF NOT EXISTS idx_netflix_engagement_tier ON netflix_contributions(engagement_tier);
CREATE INDEX IF NOT EXISTS idx_netflix_subscription_tier ON netflix_contributions(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_netflix_binge_score ON netflix_contributions(binge_score);
CREATE INDEX IF NOT EXISTS idx_netflix_total_watch_hours ON netflix_contributions(total_watch_hours);
CREATE INDEX IF NOT EXISTS idx_netflix_cohort_id ON netflix_contributions(cohort_id);
CREATE INDEX IF NOT EXISTS idx_netflix_loyalty_tier ON netflix_contributions(loyalty_tier);
CREATE INDEX IF NOT EXISTS idx_netflix_is_binge_watcher ON netflix_contributions(is_binge_watcher);

-- GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_netflix_top_genres ON netflix_contributions USING GIN (top_genres);
CREATE INDEX IF NOT EXISTS idx_netflix_sellable_data ON netflix_contributions USING GIN (sellable_data);

-- Update trigger
CREATE TRIGGER update_netflix_contributions_updated_at 
    BEFORE UPDATE ON netflix_contributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
