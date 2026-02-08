-- Add opt_out column to all contribution tables
-- This column tracks if a user has opted out of the data marketplace
-- When true, the contribution data is retained but excluded from marketplace queries

-- Add opt_out to contributions (general table - may not exist in all setups)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contributions') THEN
        ALTER TABLE contributions ADD COLUMN IF NOT EXISTS opt_out BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add opt_out to zomato_contributions
ALTER TABLE zomato_contributions ADD COLUMN IF NOT EXISTS opt_out BOOLEAN DEFAULT FALSE;

-- Add opt_out to github_contributions
ALTER TABLE github_contributions ADD COLUMN IF NOT EXISTS opt_out BOOLEAN DEFAULT FALSE;

-- Add opt_out to netflix_contributions
ALTER TABLE netflix_contributions ADD COLUMN IF NOT EXISTS opt_out BOOLEAN DEFAULT FALSE;

-- Add opt_out to blinkit_contributions
ALTER TABLE blinkit_contributions ADD COLUMN IF NOT EXISTS opt_out BOOLEAN DEFAULT FALSE;

-- Add opt_out to ubereats_contributions
ALTER TABLE ubereats_contributions ADD COLUMN IF NOT EXISTS opt_out BOOLEAN DEFAULT FALSE;

-- Add opt_out to uber_rides_contributions
ALTER TABLE uber_rides_contributions ADD COLUMN IF NOT EXISTS opt_out BOOLEAN DEFAULT FALSE;

-- Add opt_out to strava_contributions
ALTER TABLE strava_contributions ADD COLUMN IF NOT EXISTS opt_out BOOLEAN DEFAULT FALSE;

-- Create indexes for opt_out queries (to efficiently filter opted-out data)
-- Only create index if contributions table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contributions') THEN
        CREATE INDEX IF NOT EXISTS idx_contributions_opt_out ON contributions(opt_out);
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_zomato_opt_out ON zomato_contributions(opt_out);
CREATE INDEX IF NOT EXISTS idx_github_opt_out ON github_contributions(opt_out);
CREATE INDEX IF NOT EXISTS idx_netflix_opt_out ON netflix_contributions(opt_out);
CREATE INDEX IF NOT EXISTS idx_blinkit_opt_out ON blinkit_contributions(opt_out);
CREATE INDEX IF NOT EXISTS idx_ubereats_opt_out ON ubereats_contributions(opt_out);
CREATE INDEX IF NOT EXISTS idx_uber_rides_opt_out ON uber_rides_contributions(opt_out);
CREATE INDEX IF NOT EXISTS idx_strava_opt_out ON strava_contributions(opt_out);
