-- Strava Contributions Table for MYRAD
-- Stores fitness activity and profile data

CREATE TABLE IF NOT EXISTS strava_contributions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    reclaim_proof_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'verified',
    processing_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Full sellable data as JSONB
    sellable_data JSONB NOT NULL,
    metadata JSONB,
    
    -- Indexed fitness profile metrics
    fitness_tier VARCHAR(50),
    tier_label VARCHAR(100),
    activities_per_week DECIMAL(5, 2),
    primary_activity VARCHAR(50),
    engagement_score INTEGER,
    
    -- Activity totals (indexed)
    total_distance_km DECIMAL(10, 2),
    total_activities INTEGER,
    total_time_hours DECIMAL(8, 2),
    
    -- Activity breakdown
    running_distance_km DECIMAL(10, 2),
    running_count INTEGER,
    running_time_hours DECIMAL(8, 2),
    cycling_distance_km DECIMAL(10, 2),
    cycling_count INTEGER,
    cycling_time_hours DECIMAL(8, 2),
    walking_distance_km DECIMAL(10, 2),
    walking_count INTEGER,
    swimming_distance_km DECIMAL(10, 2),
    swimming_count INTEGER,
    
    -- Behavioral insights (indexed)
    consistency_score INTEGER,
    multi_sport_athlete BOOLEAN DEFAULT FALSE,
    endurance_focused BOOLEAN DEFAULT FALSE,
    outdoor_enthusiast BOOLEAN DEFAULT FALSE,
    
    -- Geo data (anonymized)
    region VARCHAR(100),
    country VARCHAR(100),
    
    -- Audience segment
    segment_id VARCHAR(255),
    cohort_id VARCHAR(255),
    data_quality_score INTEGER,
    wallet_address VARCHAR(255)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_strava_user_id ON strava_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_strava_created_at ON strava_contributions(created_at);
CREATE INDEX IF NOT EXISTS idx_strava_reclaim_proof_id ON strava_contributions(reclaim_proof_id);
CREATE INDEX IF NOT EXISTS idx_strava_fitness_tier ON strava_contributions(fitness_tier);
CREATE INDEX IF NOT EXISTS idx_strava_total_activities ON strava_contributions(total_activities);
CREATE INDEX IF NOT EXISTS idx_strava_total_distance ON strava_contributions(total_distance_km);
CREATE INDEX IF NOT EXISTS idx_strava_primary_activity ON strava_contributions(primary_activity);
CREATE INDEX IF NOT EXISTS idx_strava_engagement_score ON strava_contributions(engagement_score);
CREATE INDEX IF NOT EXISTS idx_strava_cohort_id ON strava_contributions(cohort_id);

-- GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_strava_sellable_data ON strava_contributions USING GIN (sellable_data);

-- Update trigger
CREATE TRIGGER update_strava_contributions_updated_at 
    BEFORE UPDATE ON strava_contributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
