-- SQL Script to Add Missing Profile Columns
-- Run this in Supabase SQL Editor if the columns don't exist

-- Add missing columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Update the current user's profile with sample data
-- Replace 'b1c6b933-f2ac-40c3-a818-fdc246aa62fc' with your actual user ID
UPDATE profiles
SET 
  phone = '+212 612-345678',
  company = 'My Company',
  tax_id = 'TAX123456',
  address = '123 Main Street',
  city = 'Casablanca',
  country = 'Morocco',
  postal_code = '20000'
WHERE id = 'b1c6b933-f2ac-40c3-a818-fdc246aa62fc';

-- Verify the update
SELECT * FROM profiles WHERE id = 'b1c6b933-f2ac-40c3-a818-fdc246aa62fc';
