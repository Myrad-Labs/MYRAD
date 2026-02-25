-- Migration: Fix strava_contributions unique constraint on reclaim_proof_id
-- This ensures the ON CONFLICT clause works properly

-- First, remove any duplicate reclaim_proof_ids (keep the most recent one)
DELETE FROM strava_contributions a
USING strava_contributions b
WHERE a.reclaim_proof_id = b.reclaim_proof_id 
  AND a.reclaim_proof_id IS NOT NULL
  AND a.created_at < b.created_at;

-- Create unique index (this will act as the constraint for ON CONFLICT)
CREATE UNIQUE INDEX IF NOT EXISTS idx_strava_reclaim_proof_id_unique 
ON strava_contributions(reclaim_proof_id) 
WHERE reclaim_proof_id IS NOT NULL;

-- Also add the constraint directly if it doesn't exist
-- Note: This may fail if constraint already exists, which is fine
ALTER TABLE strava_contributions 
DROP CONSTRAINT IF EXISTS strava_contributions_reclaim_proof_id_key;

ALTER TABLE strava_contributions 
ADD CONSTRAINT strava_contributions_reclaim_proof_id_key 
UNIQUE (reclaim_proof_id);
