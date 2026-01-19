-- Cleanup script to remove old unified schema tables
-- Run this after migrating to separate zomato_contributions and github_contributions tables

-- Drop old tables (in reverse dependency order)
DROP TABLE IF EXISTS contribution_categories CASCADE;
DROP TABLE IF EXISTS contribution_brands CASCADE;
DROP TABLE IF EXISTS contribution_sellable_data CASCADE;
DROP TABLE IF EXISTS contribution_analytics CASCADE;
DROP TABLE IF EXISTS contributions CASCADE;

-- Note: The function update_updated_at_column() is kept as it's used by the new tables























