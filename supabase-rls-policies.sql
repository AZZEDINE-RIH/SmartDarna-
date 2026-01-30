-- Supabase RLS Policies for profiles table
-- Run these SQL queries in your Supabase SQL Editor

-- 1. Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- 3. Create policy to allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- 4. Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 6. Create policy to allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- 7. Optional: Allow public read access to basic profile info (if needed)
-- Uncomment this if you want users to see other users' basic profiles
-- CREATE POLICY "Public can view basic profiles" ON profiles
--     FOR SELECT USING (true);

-- 8. Optional: Allow service role to bypass RLS (for admin operations)
-- This is usually already handled by the service role key
-- CREATE POLICY "Service role can manage all profiles" ON profiles
--     FOR ALL USING (auth.role() = 'service_role');

-- Verify policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';
