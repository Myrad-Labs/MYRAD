-- Add extended fields to zomato_contributions table
-- These fields extract important data from sellable_data JSONB for easier querying

ALTER TABLE zomato_contributions
ADD COLUMN IF NOT EXISTS top_cuisines JSONB,
ADD COLUMN IF NOT EXISTS top_brands JSONB,
ADD COLUMN IF NOT EXISTS segment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS chain_vs_local_preference VARCHAR(50),
ADD COLUMN IF NOT EXISTS day_of_week_distribution JSONB,
ADD COLUMN IF NOT EXISTS time_of_day_curve JSONB,
ADD COLUMN IF NOT EXISTS peak_ordering_day VARCHAR(50),
ADD COLUMN IF NOT EXISTS peak_ordering_time VARCHAR(50),
ADD COLUMN IF NOT EXISTS late_night_eater BOOLEAN,
ADD COLUMN IF NOT EXISTS price_bucket_distribution JSONB,
ADD COLUMN IF NOT EXISTS dominant_price_segment VARCHAR(50),
ADD COLUMN IF NOT EXISTS discount_usage_rate DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS offer_dependent BOOLEAN,
ADD COLUMN IF NOT EXISTS premium_vs_budget_ratio VARCHAR(50),
ADD COLUMN IF NOT EXISTS frequent_dishes JSONB,
ADD COLUMN IF NOT EXISTS favorite_restaurants JSONB,
ADD COLUMN IF NOT EXISTS competitor_mapping JSONB,
ADD COLUMN IF NOT EXISTS repeat_baskets JSONB,
ADD COLUMN IF NOT EXISTS geo_data JSONB;

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_zomato_segment_id ON zomato_contributions(segment_id);
CREATE INDEX IF NOT EXISTS idx_zomato_peak_ordering_day ON zomato_contributions(peak_ordering_day);
CREATE INDEX IF NOT EXISTS idx_zomato_peak_ordering_time ON zomato_contributions(peak_ordering_time);
CREATE INDEX IF NOT EXISTS idx_zomato_late_night_eater ON zomato_contributions(late_night_eater);
CREATE INDEX IF NOT EXISTS idx_zomato_dominant_price_segment ON zomato_contributions(dominant_price_segment);
CREATE INDEX IF NOT EXISTS idx_zomato_offer_dependent ON zomato_contributions(offer_dependent);
CREATE INDEX IF NOT EXISTS idx_zomato_chain_vs_local ON zomato_contributions(chain_vs_local_preference);

-- GIN indexes for JSONB fields (for efficient querying within JSONB)
CREATE INDEX IF NOT EXISTS idx_zomato_top_cuisines_gin ON zomato_contributions USING gin(top_cuisines);
CREATE INDEX IF NOT EXISTS idx_zomato_top_brands_gin ON zomato_contributions USING gin(top_brands);
CREATE INDEX IF NOT EXISTS idx_zomato_day_of_week_dist_gin ON zomato_contributions USING gin(day_of_week_distribution);
CREATE INDEX IF NOT EXISTS idx_zomato_time_of_day_curve_gin ON zomato_contributions USING gin(time_of_day_curve);
CREATE INDEX IF NOT EXISTS idx_zomato_geo_data_gin ON zomato_contributions USING gin(geo_data);


























