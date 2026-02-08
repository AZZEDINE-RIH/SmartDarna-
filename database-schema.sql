-- Database Schema for SmartDarna E-commerce Platform
-- Run these SQL queries in your Supabase SQL Editor

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  seller_id UUID REFERENCES profiles(id),
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  shipping_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_per_item DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Categories (public read, authenticated insert/update)
CREATE POLICY "Categories are publicly viewable" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create categories" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Sellers and admins can update categories" ON categories
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'seller')
    )
  );

-- 7. RLS Policies for Products
CREATE POLICY "Products are publicly viewable" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Sellers can manage their products" ON products
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    seller_id = auth.uid()
  );

CREATE POLICY "Admins can manage all products" ON products
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 8. RLS Policies for Orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Sellers can view orders for their products" ON orders
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM order_items 
      JOIN products ON order_items.product_id = products.id
      WHERE order_items.order_id = orders.id 
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 9. RLS Policies for Order Items
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can view order items for their products" ON order_items
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = order_items.product_id 
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 10. Insert Sample Data
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Fashion and apparel'),
('Food', 'Food and beverages'),
('Books', 'Books and educational materials'),
('Home & Garden', 'Home improvement and garden supplies')
ON CONFLICT DO NOTHING;

-- 11. Create Functions for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
