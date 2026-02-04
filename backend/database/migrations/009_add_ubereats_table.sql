-- Uber Eats Contributions Table for MYRAD
-- Stores food delivery order history data

CREATE TABLE IF NOT EXISTS ubereats_contributions (
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
    
    -- Indexed transaction metrics
    total_orders INTEGER,
    total_spend DECIMAL(15, 2),
    avg_order_value DECIMAL(10, 2),
    data_window_days INTEGER,
    
    -- Cuisine preferences (indexed)
    top_cuisines JSONB,
    cuisine_diversity_score INTEGER,
    
    -- Brand affinity (indexed)
    top_brands JSONB,
    brand_loyalty_score VARCHAR(50),
    
    -- Behavioral insights (indexed)
    spend_bracket VARCHAR(50),
    price_sensitivity_index INTEGER,
    price_sensitivity_category VARCHAR(50),
    peak_ordering_day VARCHAR(20),
    peak_ordering_time VARCHAR(20),
    late_night_eater BOOLEAN DEFAULT FALSE,
    avg_items_per_order DECIMAL(5, 2),
    
    -- Temporal behavior (indexed)
    day_of_week_distribution JSONB,
    time_of_day_curve JSONB,
    
    -- Audience segment
    segment_id VARCHAR(255),
    cohort_id VARCHAR(255),
    data_quality_score INTEGER,
    wallet_address VARCHAR(255)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ubereats_user_id ON ubereats_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_ubereats_created_at ON ubereats_contributions(created_at);
CREATE INDEX IF NOT EXISTS idx_ubereats_reclaim_proof_id ON ubereats_contributions(reclaim_proof_id);
CREATE INDEX IF NOT EXISTS idx_ubereats_total_orders ON ubereats_contributions(total_orders);
CREATE INDEX IF NOT EXISTS idx_ubereats_total_spend ON ubereats_contributions(total_spend);
CREATE INDEX IF NOT EXISTS idx_ubereats_spend_bracket ON ubereats_contributions(spend_bracket);
CREATE INDEX IF NOT EXISTS idx_ubereats_price_sensitivity ON ubereats_contributions(price_sensitivity_category);
CREATE INDEX IF NOT EXISTS idx_ubereats_cohort_id ON ubereats_contributions(cohort_id);

-- GIN indexes for JSONB queries
CREATE INDEX IF NOT EXISTS idx_ubereats_top_cuisines ON ubereats_contributions USING GIN (top_cuisines);
CREATE INDEX IF NOT EXISTS idx_ubereats_top_brands ON ubereats_contributions USING GIN (top_brands);
CREATE INDEX IF NOT EXISTS idx_ubereats_sellable_data ON ubereats_contributions USING GIN (sellable_data);

-- Update trigger
CREATE TRIGGER update_ubereats_contributions_updated_at 
    BEFORE UPDATE ON ubereats_contributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
