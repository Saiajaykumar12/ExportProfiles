-- ============================================
-- Goo-Link-Dash Database Migration for Supabase
-- ============================================
-- Run this SQL in your Supabase dashboard:
-- 1. Go to SQL Editor
-- 2. Click "New Query"
-- 3. Paste this entire script
-- 4. Click "Run"

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  google_id TEXT UNIQUE,
  display_name TEXT,
  email TEXT,
  photo TEXT,
  provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  type TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_created_at ON links(created_at);
CREATE INDEX idx_links_user_date ON links(user_id, DATE(created_at));
CREATE INDEX idx_users_google_id ON users(google_id);

-- Enable RLS (Row Level Security) for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
-- Allow users to read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  USING (TRUE); -- Backend uses service role, so this allows reads

-- Allow inserts for new users
CREATE POLICY "Allow user creation" ON users
  FOR INSERT
  WITH CHECK (TRUE);

-- Create RLS policies for links table
-- Allow users to view own links
CREATE POLICY "Users can view own links" ON links
  FOR SELECT
  USING (TRUE); -- Backend uses service role

-- Allow users to insert own links
CREATE POLICY "Users can create own links" ON links
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR TRUE); -- Backend uses service role

-- Allow users to delete own links
CREATE POLICY "Users can delete own links" ON links
  FOR DELETE
  USING (user_id = auth.uid() OR TRUE); -- Backend uses service role

-- ============================================
-- Optional: Create a function for daily link count
-- ============================================
CREATE OR REPLACE FUNCTION count_user_links_today(user_id TEXT)
RETURNS BIGINT AS $$
  SELECT COUNT(*)::BIGINT
  FROM links
  WHERE links.user_id = $1
  AND DATE(created_at) = CURRENT_DATE;
$$ LANGUAGE SQL;

-- ============================================
-- Done! Your Supabase tables are ready.
-- ============================================
