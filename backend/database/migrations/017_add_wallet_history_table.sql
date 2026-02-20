-- Wallet History / Audit Table for Privy App ID Migration
-- Tracks all wallet address changes per user for safety and auditability
-- When switching Privy App IDs, users get new wallets — this table preserves the record

CREATE TABLE IF NOT EXISTS wallet_history (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    old_wallet_address VARCHAR(255),
    new_wallet_address VARCHAR(255),
    old_privy_id VARCHAR(255),
    new_privy_id VARCHAR(255),
    migration_reason VARCHAR(255) DEFAULT 'privy_app_id_switch',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_wallet_history_user_id ON wallet_history(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_history_old_wallet ON wallet_history(old_wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_history_new_wallet ON wallet_history(new_wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_history_created_at ON wallet_history(created_at DESC);

-- Also ensure email has a unique index for email-based reconciliation
-- (email should be unique per user to enable reliable matching)
-- Using a partial unique index so NULLs are allowed (users without email)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique 
    ON users(email) 
    WHERE email IS NOT NULL;
