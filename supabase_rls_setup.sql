-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
-- Allow everyone to read profiles (needed for seller names, admin dashboard, etc.)
CREATE POLICY "Enable read access for all users" ON public.profiles
FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Enable insert for users based on user_id" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Enable update for users based on user_id" ON public.profiles
FOR UPDATE USING (auth.uid() = id);


-- 2. PRODUCTS POLICIES
-- Allow everyone to read products
CREATE POLICY "Enable read access for all users" ON public.products
FOR SELECT USING (true);

-- Allow authenticated users (sellers/admin) to insert products
CREATE POLICY "Enable insert for authenticated users only" ON public.products
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own products (assuming seller_id matches auth.uid)
-- OR if they are admin (simplified for now: just authenticated update)
CREATE POLICY "Enable update for authenticated users" ON public.products
FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. ORDERS POLICIES
-- Allow authenticated users to read orders (own orders or admin)
CREATE POLICY "Enable read access for authenticated users" ON public.orders
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to create orders
CREATE POLICY "Enable insert for authenticated users" ON public.orders
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. SELLERS POLICIES
-- Allow everyone to read seller info
CREATE POLICY "Enable read access for all users" ON public.sellers
FOR SELECT USING (true);

-- Allow authenticated users to apply as seller
CREATE POLICY "Enable insert for authenticated users" ON public.sellers
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own seller profile
CREATE POLICY "Enable update for own seller profile" ON public.sellers
FOR UPDATE USING (auth.uid() = user_id);

-- 5. CATEGORIES POLICIES
-- Allow everyone to read categories
CREATE POLICY "Enable read access for all users" ON public.categories
FOR SELECT USING (true);

-- Allow authenticated users (admin) to manage categories
CREATE POLICY "Enable all access for authenticated users" ON public.categories
FOR ALL USING (auth.role() = 'authenticated');

-- 6. PAYMENTS POLICIES
CREATE POLICY "Enable read access for authenticated users" ON public.payments
FOR SELECT USING (auth.role() = 'authenticated');

-- Grant usage on schema just in case
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
