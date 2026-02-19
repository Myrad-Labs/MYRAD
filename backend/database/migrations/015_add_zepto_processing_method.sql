-- Add processing_method to zepto_contributions if missing
-- (Table may have been created before migration 013 or with different schema)

ALTER TABLE zepto_contributions 
ADD COLUMN IF NOT EXISTS processing_method VARCHAR(100);
