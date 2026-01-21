-- Add movies_watched and top_series columns to netflix_contributions table
-- These columns extract data from sellable_data.content_catalog for easier querying

ALTER TABLE netflix_contributions
ADD COLUMN IF NOT EXISTS movies_watched JSONB,
ADD COLUMN IF NOT EXISTS top_series JSONB;

-- Create GIN indexes for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_netflix_movies_watched ON netflix_contributions USING GIN (movies_watched);
CREATE INDEX IF NOT EXISTS idx_netflix_top_series ON netflix_contributions USING GIN (top_series);





















