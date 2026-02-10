-- FIX: Allow Sellers to see Orders containing their products
-- Run this in Supabase SQL Editor

-- Drop the restrictive policy first (if it exists from previous script)
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

-- Create a comprehensive policy for ORDERS SELECT
CREATE POLICY "Users can view own orders OR orders with their products" 
ON orders FOR SELECT 
USING (
  -- 1. User is the customer
  auth.uid() = customer_id
  OR
  -- 2. User is the seller of at least one item in the order
  EXISTS (
    SELECT 1 FROM order_items
    JOIN products ON order_items.product_id = products.id
    WHERE order_items.order_id = orders.id
    AND products.seller_id = auth.uid()
  )
);
