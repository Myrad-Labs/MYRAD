-- Add wallet_address column to all contribution tables
-- This column stores the wallet address associated with each contribution

ALTER TABLE zomato_contributions
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255);

ALTER TABLE github_contributions
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255);

ALTER TABLE netflix_contributions
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255);

-- Create indexes for wallet_address to enable fast lookups
CREATE INDEX IF NOT EXISTS idx_zomato_wallet_address ON zomato_contributions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_github_wallet_address ON github_contributions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_netflix_wallet_address ON netflix_contributions(wallet_address);

