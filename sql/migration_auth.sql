-- Migration: Add custom authentication to profiles table
-- 0. Remove link to Supabase Auth (since we use custom auth)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 1. Add custom authentication columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update existing profiles (if any) to have a username based on their full_name if empty
UPDATE profiles 
SET username = LOWER(REPLACE(full_name, ' ', '.'))
WHERE username IS NULL AND full_name IS NOT NULL;

-- 2. Add ingame_name if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ingame_name TEXT;

-- 3. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Allow anyone to insert (for registration)
DROP POLICY IF EXISTS "Allow public insert" ON profiles;
CREATE POLICY "Allow public insert" ON profiles FOR INSERT WITH CHECK (true);

-- Allow anyone to read profiles
DROP POLICY IF EXISTS "Allow public select" ON profiles;
CREATE POLICY "Allow public select" ON profiles FOR SELECT USING (true);

-- Allow updates (we'll handle security in our API)
DROP POLICY IF EXISTS "Allow public update" ON profiles;
CREATE POLICY "Allow public update" ON profiles FOR UPDATE USING (true);

