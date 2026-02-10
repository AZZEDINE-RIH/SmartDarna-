-- FIX: Resolve 500 Error caused by RLS Infinite Recursion
-- Run this in Supabase SQL Editor

-- 1. Create a Helper Function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.seller_has_item_in_order(_order_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = _order_id
    AND p.seller_id = auth.uid()
  );
$$;

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own orders OR orders with their products" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Sellers can view items of their products" ON order_items;
DROP POLICY IF EXISTS "Users can view relevant order items" ON order_items;
DROP POLICY IF EXISTS "Users can view relevant orders" ON orders;

-- 3. Re-create ORDERS Policy
CREATE POLICY "Users can view relevant orders" 
ON orders FOR SELECT 
TO public
USING (
  auth.uid() = customer_id
  OR
  public.seller_has_item_in_order(id)
);

-- 4. Re-create ORDER_ITEMS Policy
CREATE POLICY "Users can view relevant order items" 
ON order_items FOR SELECT 
TO public
USING (
  product_id IN (SELECT id FROM products WHERE seller_id = auth.uid())
  OR
  order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
);
