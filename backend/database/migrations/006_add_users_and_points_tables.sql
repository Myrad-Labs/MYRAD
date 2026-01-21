-- Users and Points Tables for MYRAD
-- Stores user profiles and points transactions

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    privy_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    wallet_address VARCHAR(255),
    username VARCHAR(255),
    streak INTEGER DEFAULT 0,
    last_contribution_date TIMESTAMP WITH TIME ZONE,
    total_points INTEGER DEFAULT 0,
    league VARCHAR(50) DEFAULT 'Bronze',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Points History Table (transaction log)
CREATE TABLE IF NOT EXISTS points_history (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_privy_id ON users(privy_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_total_points ON users(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_users_league ON users(league);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Create indexes for points_history table
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON points_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_history_reason ON points_history(reason);

-- Update timestamp trigger for users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();






