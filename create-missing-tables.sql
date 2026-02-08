-- Create Missing Tables for SmartDarna Dashboard
-- Run this in Supabase SQL Editor

-- 1. Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for orders table
-- Users can manage their own orders
CREATE POLICY "users_manage_own_orders" ON public."orders"
  FOR ALL USING ( (SELECT auth.uid()) = user_id );

-- Admin has full access to all orders
CREATE POLICY "admin_full_orders_access" ON public."orders"
  FOR ALL USING ( (SELECT auth.uid()) = '09bd3487-7e50-42c1-a3eb-edaa5f6743f1' );

-- Everyone can view order status (for order tracking)
CREATE POLICY "view_order_status" ON public."orders"
  FOR SELECT USING ( true );

-- 5. Enable RLS on order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for order_items table
-- Access based on order ownership
CREATE POLICY "order_items_access" ON public."order_items"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (
        (SELECT auth.uid()) = orders.user_id 
        OR (SELECT auth.uid()) = '09bd3487-7e50-42c1-a3eb-edaa5f6743f1'
      )
    )
  );

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public."orders"(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public."orders"(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public."orders"(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public."order_items"(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public."order_items"(product_id);

-- 8. Create function to update order total when items change
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE orders 
    SET total_amount = (
      SELECT COALESCE(SUM(quantity * price), 0)
      FROM order_items 
      WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE orders 
    SET total_amount = (
      SELECT COALESCE(SUM(quantity * price), 0)
      FROM order_items 
      WHERE order_id = OLD.order_id
    ),
    updated_at = NOW()
    WHERE id = OLD.order_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 9. Create triggers for automatic order total updates
DROP TRIGGER IF EXISTS trigger_update_order_total_insert ON public."order_items";
CREATE TRIGGER trigger_update_order_total_insert
  AFTER INSERT OR UPDATE ON public."order_items"
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total();

DROP TRIGGER IF EXISTS trigger_update_order_total_delete ON public."order_items";
CREATE TRIGGER trigger_update_order_total_delete
  AFTER DELETE ON public."order_items"
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total();

-- 10. Insert sample data for testing (remove in production)
-- First, let's check if we have users and products
DO $$
DECLARE
    user_count INTEGER;
    product_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM profiles WHERE role = 'user' LIMIT 1;
    SELECT COUNT(*) INTO product_count FROM products LIMIT 1;
    
    -- Only insert sample data if we don't have orders
    IF (SELECT COUNT(*) FROM orders) = 0 AND user_count > 0 AND product_count > 0 THEN
        -- Insert sample orders
        INSERT INTO orders (id, user_id, total_amount, status, created_at) VALUES
        ('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM profiles WHERE role = 'user' LIMIT 1), 299.99, 'completed', NOW() - INTERVAL '2 days'),
        ('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM profiles WHERE role = 'user' LIMIT 1 OFFSET 1), 89.99, 'completed', NOW() - INTERVAL '1 day'),
        ('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM profiles WHERE role = 'user' LIMIT 1 OFFSET 2), 124.50, 'pending', NOW() - INTERVAL '3 hours'),
        ('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM profiles WHERE role = 'user' LIMIT 1), 45.00, 'processing', NOW() - INTERVAL '5 hours'),
        ('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM profiles WHERE role = 'user' LIMIT 1), 156.75, 'completed', NOW() - INTERVAL '1 week');
        
        -- Insert sample order items
        INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
        ('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM products LIMIT 1), 1, 299.99),
        ('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM products LIMIT 1 OFFSET 1), 1, 89.99),
        ('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM products LIMIT 1 OFFSET 2), 2, 62.25),
        ('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM products LIMIT 1 OFFSET 3), 1, 45.00),
        ('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM products LIMIT 1 OFFSET 4), 3, 52.25);
        
        RAISE NOTICE 'Sample orders and order items created successfully';
    END IF;
END $$;

-- 11. Verify the setup
SELECT 
    'orders' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'

UNION ALL

SELECT 
    'order_items' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'order_items' 
AND table_schema = 'public'

ORDER BY table_name, ordinal_position;

-- 12. Check RLS policies
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
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;
