-- SQL Script to Add Sample Products and Orders
-- Run this in Supabase SQL Editor to populate your dashboard

-- 1. Add Sample Products for the logged-in seller
-- Replace 'b1c6b933-f2ac-40c3-a818-fdc246aa62fc' with your actual user ID if different
INSERT INTO products (id, name, description, price, stock, category, image, seller_id, created_at)
VALUES 
  (gen_random_uuid(), 'Premium Leather Bag', 'Handcrafted leather bag', 1200, 15, 'Accessories', 'https://images.unsplash.com/photo-1590874103328-eac65d680dab?w=500', 'b1c6b933-f2ac-40c3-a818-fdc246aa62fc', NOW()),
  (gen_random_uuid(), 'Moroccan Rug', 'Authentic wool rug', 850, 5, 'Home', 'https://images.unsplash.com/photo-1596236561166-51f7bb37f141?w=500', 'b1c6b933-f2ac-40c3-a818-fdc246aa62fc', NOW()),
  (gen_random_uuid(), 'Ceramic Vase', 'Hand-painted vase', 350, 20, 'Decor', 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=500', 'b1c6b933-f2ac-40c3-a818-fdc246aa62fc', NOW());

-- 2. Add a Sample Order
INSERT INTO orders (id, customer_id, status, total_amount, created_at)
VALUES 
  (gen_random_uuid(), 'b1c6b933-f2ac-40c3-a818-fdc246aa62fc', 'completed', 2050, NOW());

-- 3. Link Order to Products (Create Sales)
-- We need to get the IDs we just created, but in this simple script we'll just insert based on the most recent products for this seller
-- This is a bit hacky for SQL script without variables, ideally use the IDs returned above.
-- For safety, you might want to run the INSERTs above, check the IDs, then run these.

-- ALTERNATIVE: Insert with subqueries (more robust)
INSERT INTO order_items (id, order_id, product_id, quantity, price_per_item)
SELECT 
  gen_random_uuid(), 
  (SELECT id FROM orders ORDER BY created_at DESC LIMIT 1), 
  (SELECT id FROM products WHERE seller_id = 'b1c6b933-f2ac-40c3-a818-fdc246aa62fc' ORDER BY created_at DESC LIMIT 1),
  1, 
  1200;

INSERT INTO order_items (id, order_id, product_id, quantity, price_per_item)
SELECT 
  gen_random_uuid(), 
  (SELECT id FROM orders ORDER BY created_at DESC LIMIT 1), 
  (SELECT id FROM products WHERE seller_id = 'b1c6b933-f2ac-40c3-a818-fdc246aa62fc' ORDER BY created_at DESC OFFSET 1 LIMIT 1),
  1, 
  850;
