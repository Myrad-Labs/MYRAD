-- Add composite indexes for performance optimization

-- Composite index for weekly leaderboard query (JOIN + WHERE on created_at + GROUP BY user_id)
CREATE INDEX IF NOT EXISTS idx_points_history_user_created ON points_history(user_id, created_at DESC);

-- Composite index for users leaderboard ordering (total_points DESC, created_at ASC)
CREATE INDEX IF NOT EXISTS idx_users_leaderboard ON users(total_points DESC, created_at ASC);
