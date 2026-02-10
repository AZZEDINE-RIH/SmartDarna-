-- SQL Script to Fix Row Level Security (RLS) Permissions
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on tables (if not already enabled, this is safe to run)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies for PRODUCTS
-- Allow anyone to view products
CREATE POLICY "Public products are viewable by everyone" 
ON products FOR SELECT 
USING (true);

-- Allow sellers to insert their own products
CREATE POLICY "Users can insert their own products" 
ON products FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

-- Allow sellers to update their own products
CREATE POLICY "Users can update their own products" 
ON products FOR UPDATE 
USING (auth.uid() = seller_id);

-- Allow sellers to delete their own products
CREATE POLICY "Users can delete their own products" 
ON products FOR DELETE 
USING (auth.uid() = seller_id);

-- 3. Create Policies for ORDERS
-- Allow users to view their own orders (as customers)
CREATE POLICY "Users can view their own orders" 
ON orders FOR SELECT 
USING (auth.uid() = customer_id);

-- Allow users to create orders
CREATE POLICY "Users can create orders" 
ON orders FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

-- 4. Create Policies for ORDER_ITEMS
-- This is crucial for the Seller Dashboard!
-- Sellers need to see items that belong to their products.
-- Customers need to see items in their orders.

CREATE POLICY "Sellers can view items of their products" 
ON order_items FOR SELECT 
USING (
  product_id IN (
    SELECT id FROM products WHERE seller_id = auth.uid()
  )
  OR
  order_id IN (
    SELECT id FROM orders WHERE customer_id = auth.uid()
  )
);

CREATE POLICY "Users can insert order items" 
ON order_items FOR INSERT 
WITH CHECK (
  order_id IN (
    SELECT id FROM orders WHERE customer_id = auth.uid()
  )
);

-- 5. Fix Profiles Permissions
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);
