-- Uber Rides Contributions Table for MYRAD
-- Stores mobility/rideshare data

CREATE TABLE IF NOT EXISTS uber_rides_contributions (
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
    
    -- Indexed ride summary metrics
    total_rides INTEGER,
    total_spend DECIMAL(15, 2),
    total_distance_km DECIMAL(10, 2),
    total_duration_min INTEGER,
    avg_fare DECIMAL(10, 2),
    avg_distance_km DECIMAL(8, 2),
    avg_duration_min INTEGER,
    
    -- Ride preferences (indexed)
    preferred_ride_type VARCHAR(50),
    ride_type_distribution JSONB,
    uses_premium BOOLEAN DEFAULT FALSE,
    uses_shared BOOLEAN DEFAULT FALSE,
    
    -- Temporal behavior (indexed)
    peak_time_period VARCHAR(50),
    peak_day VARCHAR(20),
    is_commuter BOOLEAN DEFAULT FALSE,
    weekend_preference BOOLEAN DEFAULT FALSE,
    late_night_rider BOOLEAN DEFAULT FALSE,
    
    -- Behavioral insights (indexed)
    spend_bracket VARCHAR(50),
    frequency VARCHAR(50),
    urban_mobility_score INTEGER,
    
    -- Audience segment
    segment_id VARCHAR(255),
    cohort_id VARCHAR(255),
    data_quality_score INTEGER,
    wallet_address VARCHAR(255)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_uber_rides_user_id ON uber_rides_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_uber_rides_created_at ON uber_rides_contributions(created_at);
CREATE INDEX IF NOT EXISTS idx_uber_rides_reclaim_proof_id ON uber_rides_contributions(reclaim_proof_id);
CREATE INDEX IF NOT EXISTS idx_uber_rides_total_rides ON uber_rides_contributions(total_rides);
CREATE INDEX IF NOT EXISTS idx_uber_rides_total_spend ON uber_rides_contributions(total_spend);
CREATE INDEX IF NOT EXISTS idx_uber_rides_spend_bracket ON uber_rides_contributions(spend_bracket);
CREATE INDEX IF NOT EXISTS idx_uber_rides_is_commuter ON uber_rides_contributions(is_commuter);
CREATE INDEX IF NOT EXISTS idx_uber_rides_preferred_ride_type ON uber_rides_contributions(preferred_ride_type);
CREATE INDEX IF NOT EXISTS idx_uber_rides_cohort_id ON uber_rides_contributions(cohort_id);

-- GIN indexes for JSONB queries
CREATE INDEX IF NOT EXISTS idx_uber_rides_ride_type_distribution ON uber_rides_contributions USING GIN (ride_type_distribution);
CREATE INDEX IF NOT EXISTS idx_uber_rides_sellable_data ON uber_rides_contributions USING GIN (sellable_data);

-- Update trigger
CREATE TRIGGER update_uber_rides_contributions_updated_at 
    BEFORE UPDATE ON uber_rides_contributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
