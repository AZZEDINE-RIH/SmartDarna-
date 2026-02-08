-- Complete Role-Based Authentication Setup for SmartDarna
-- Run this in Supabase SQL Editor

-- 1. Create role enum type
CREATE TYPE user_role AS ENUM ('user', 'seller', 'admin');

-- 2. Update profiles table to use the enum (if not already done)
ALTER TABLE profiles 
ALTER COLUMN role TYPE user_role USING role::user_role;

-- 3. Drop all existing policies
DROP POLICY IF EXISTS "profiles_select_self" ON public."profiles";
DROP POLICY IF EXISTS "profiles_insert_self" ON public."profiles";
DROP POLICY IF EXISTS "profiles_update_self" ON public."profiles";
DROP POLICY IF EXISTS "profiles_delete_self" ON public."profiles";
DROP POLICY IF EXISTS "Users can view own profile" ON public."profiles";
DROP POLICY IF EXISTS "Users can insert own profile" ON public."profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON public."profiles";
DROP POLICY IF EXISTS "Users can delete own profile" ON public."profiles";

-- 4. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create proper RLS policies for role-based access
CREATE POLICY "profiles_select_self" ON public."profiles"
  FOR SELECT
  TO authenticated
  USING ( (SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = id );

CREATE POLICY "profiles_insert_self" ON public."profiles"
  FOR INSERT
  TO authenticated
  WITH CHECK ( (SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = id );

CREATE POLICY "profiles_update_self" ON public."profiles"
  FOR UPDATE
  TO authenticated
  USING ( (SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = id )
  WITH CHECK ( (SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = id );

CREATE POLICY "profiles_delete_self" ON public."profiles"
  FOR DELETE
  TO authenticated
  USING ( (SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = id );

-- 6. Create function to assign role based on registration
CREATE OR REPLACE FUNCTION assign_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is not provided, assign default based on email or user preference
  IF NEW.role IS NULL THEN
    -- Assign 'seller' role if email contains business indicators, otherwise 'user'
    IF NEW.email ~* '(business|company|restaurant|shop|store|seller|vendor)' THEN
      NEW.role := 'seller';
    ELSE
      NEW.role := 'user';
    END IF;
  END IF;
  
  -- Set default values
  NEW.is_active := true;
  NEW.created_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for auto role assignment
DROP TRIGGER IF EXISTS trigger_assign_user_role ON public."profiles";
CREATE TRIGGER trigger_assign_user_role
  BEFORE INSERT ON public."profiles"
  FOR EACH ROW
  EXECUTE FUNCTION assign_user_role();

-- 8. Create additional tables for role-specific data (optional)
-- Products table for sellers
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS policies for products (sellers can only manage their own products)
CREATE POLICY "sellers_manage_own_products" ON public."products"
  FOR ALL USING ( (SELECT auth.uid()) = seller_id );

CREATE POLICY "everyone_view_active_products" ON public."products"
  FOR SELECT USING ( is_active = true );

-- 9. Verify setup
SELECT 
    'profiles' as table_name,
    polname, 
    polcmd, 
    polroles::text, 
    polqual::text, 
    polwith_check::text
FROM pg_policy
WHERE polrelid = 'public.profiles'::regclass

UNION ALL

SELECT 
    'products' as table_name,
    polname, 
    polcmd, 
    polroles::text, 
    polqual::text, 
    polwith_check::text
FROM pg_policy
WHERE polrelid = 'public.products'::regclass;

-- 10. Test data (optional - remove in production)
-- INSERT INTO profiles (id, name, email, role, phone, address, is_active, created_at)
-- VALUES ('test-user-id', 'Test User', 'test@example.com', 'user', '1234567890', 'Test Address', true, NOW());
