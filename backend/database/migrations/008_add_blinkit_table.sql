-- Blinkit Contributions Table for MYRAD
-- Stores quick commerce/grocery delivery order data

CREATE TABLE IF NOT EXISTS blinkit_contributions (
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
    total_items INTEGER,
    avg_items_per_order DECIMAL(5, 2),
    data_window_days INTEGER,
    
    -- Category preferences (indexed)
    top_categories JSONB,
    category_diversity_score INTEGER,
    essentials_buyer BOOLEAN DEFAULT FALSE,
    snacks_buyer BOOLEAN DEFAULT FALSE,
    personal_care_buyer BOOLEAN DEFAULT FALSE,
    
    -- Brand affinity (indexed)
    top_brands JSONB,
    brand_loyalty_score VARCHAR(50),
    
    -- Behavioral insights (indexed)
    spend_bracket VARCHAR(50),
    order_frequency VARCHAR(50),
    
    -- Audience segment
    segment_id VARCHAR(255),
    cohort_id VARCHAR(255),
    data_quality_score INTEGER,
    wallet_address VARCHAR(255)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_blinkit_user_id ON blinkit_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_blinkit_created_at ON blinkit_contributions(created_at);
CREATE INDEX IF NOT EXISTS idx_blinkit_reclaim_proof_id ON blinkit_contributions(reclaim_proof_id);
CREATE INDEX IF NOT EXISTS idx_blinkit_total_orders ON blinkit_contributions(total_orders);
CREATE INDEX IF NOT EXISTS idx_blinkit_total_spend ON blinkit_contributions(total_spend);
CREATE INDEX IF NOT EXISTS idx_blinkit_spend_bracket ON blinkit_contributions(spend_bracket);
CREATE INDEX IF NOT EXISTS idx_blinkit_order_frequency ON blinkit_contributions(order_frequency);
CREATE INDEX IF NOT EXISTS idx_blinkit_cohort_id ON blinkit_contributions(cohort_id);

-- GIN indexes for JSONB queries
CREATE INDEX IF NOT EXISTS idx_blinkit_top_categories ON blinkit_contributions USING GIN (top_categories);
CREATE INDEX IF NOT EXISTS idx_blinkit_top_brands ON blinkit_contributions USING GIN (top_brands);
CREATE INDEX IF NOT EXISTS idx_blinkit_sellable_data ON blinkit_contributions USING GIN (sellable_data);

-- Update trigger
CREATE TRIGGER update_blinkit_contributions_updated_at 
    BEFORE UPDATE ON blinkit_contributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
