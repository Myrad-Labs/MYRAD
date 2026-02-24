-- Add referred_by column to users table (if it doesn't exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by VARCHAR(255);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(255),
    referral_code VARCHAR(255) UNIQUE NOT NULL,
    successful_ref INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_wallet_address ON referrals(wallet_address);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
