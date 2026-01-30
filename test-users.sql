-- Test User Creation Script
-- Run this in Supabase SQL Editor to create test users with different roles

-- First, ensure the profiles table and triggers are set up
-- (This should have been done with the create-test-user.sql script)

-- Create test users manually (bypassing email verification for testing)
-- Note: This requires service role key in production, but for testing we can insert directly

-- Test Admin User
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  gen_random_uuid(),
  'admin@test.com',
  NOW(),
  NULL,
  NULL,
  NOW(),
  NOW(),
  '{"name": "Test Admin", "role": "admin"}',
  false
) ON CONFLICT (email) DO NOTHING;

-- Test Seller User  
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  gen_random_uuid(),
  'seller@test.com',
  NOW(),
  NULL,
  NULL,
  NOW(),
  NOW(),
  '{"name": "Test Seller", "role": "seller"}',
  false
) ON CONFLICT (email) DO NOTHING;

-- Test Regular User
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  gen_random_uuid(),
  'user@test.com',
  NOW(),
  NULL,
  NULL,
  NOW(),
  NOW(),
  '{"name": "Test User", "role": "user"}',
  false
) ON CONFLICT (email) DO NOTHING;

-- Set default passwords for test users (this would normally be done through Supabase Auth)
-- For testing, you'll need to use these emails and any password, or create users through the signup form

-- Check existing users
SELECT 
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users 
WHERE email LIKE '%@test.com'
ORDER BY email;
