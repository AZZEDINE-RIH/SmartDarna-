# SmartDarna Database Analysis & Static Data Mapping

## 📊 Database Schema Overview

### Core Tables Structure

#### 1. **profiles** Table (Users Management)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,                    -- Auth user ID
  name TEXT NOT NULL,                      -- User full name
  email TEXT NOT NULL,                     -- User email
  role user_role NOT NULL,                 -- ENUM: 'user', 'seller', 'admin'
  phone TEXT,                              -- Phone number (optional)
  address TEXT,                            -- Address (optional)
  is_active BOOLEAN DEFAULT true,          -- Account status
  created_at TIMESTAMP WITH TIME ZONE,    -- Registration date
  updated_at TIMESTAMP WITH TIME ZONE     -- Last update
);
```

#### 2. **products** Table (Product Management)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,                    -- Product ID
  seller_id UUID REFERENCES profiles(id), -- Owner (seller) ID
  name TEXT NOT NULL,                      -- Product name
  description TEXT,                        -- Product description
  price DECIMAL(10,2) NOT NULL,           -- Product price
  category TEXT,                          -- Product category
  image_url TEXT,                         -- Product image URL
  is_active BOOLEAN DEFAULT true,          -- Product status
  created_at TIMESTAMP WITH TIME ZONE,    -- Creation date
  updated_at TIMESTAMP WITH TIME ZONE     -- Last update
);
```

#### 3. **orders** Table (Order Management)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,                    -- Order ID
  user_id UUID REFERENCES profiles(id),   -- Customer ID
  total_amount DECIMAL(10,2) NOT NULL,     -- Order total
  status TEXT NOT NULL,                    -- Order status
  created_at TIMESTAMP WITH TIME ZONE,    -- Order date
  updated_at TIMESTAMP WITH TIME ZONE     -- Last update
);
```

#### 4. **order_items** Table (Order Details)
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,                    -- Order item ID
  order_id UUID REFERENCES orders(id),    -- Parent order ID
  product_id UUID REFERENCES products(id), -- Product ID
  quantity INTEGER NOT NULL,               -- Item quantity
  price DECIMAL(10,2) NOT NULL,           -- Item price
  created_at TIMESTAMP WITH TIME ZONE     -- Creation date
);
```

## 🔄 Static Data → Database Mapping

### Dashboard Overview Statistics

| Static Data | Database Source | Query | Field Mapping |
|-------------|----------------|-------|---------------|
| **Total Users: 8,282** | `profiles` table | `SELECT COUNT(*) FROM profiles WHERE role = 'user'` | `COUNT(id)` |
| **Total Sellers: 1,426** | `profiles` table | `SELECT COUNT(*) FROM profiles WHERE role = 'seller'` | `COUNT(id)` |
| **Total Revenue: $48,574** | `orders` table | `SELECT SUM(total_amount) FROM orders WHERE status = 'completed'` | `SUM(total_amount)` |
| **Total Orders: 3,842** | `orders` table | `SELECT COUNT(*) FROM orders` | `COUNT(id)` |

### Growth Calculations

| Static Data | Database Source | Calculation Logic |
|-------------|----------------|------------------|
| **Users Growth: +12.5%** | `profiles.created_at` | `(current_month_users - previous_month_users) / previous_month_users * 100` |
| **Orders Growth: -5.4%** | `orders.created_at` | `(current_month_orders - previous_month_orders) / previous_month_orders * 100` |
| **Revenue Growth: +23.1%** | `orders.total_amount, created_at` | `(current_month_revenue - previous_month_revenue) / previous_month_revenue * 100` |

### Product Categories Revenue

| Static Data | Database Source | Query |
|-------------|----------------|-------|
| **Electronics: 45%** | `orders → order_items → products` | `SELECT products.category, SUM(orders.total_amount) FROM orders JOIN order_items ON orders.id = order_items.order_id JOIN products ON order_items.product_id = products.id WHERE orders.status = 'completed' GROUP BY products.category` |
| **Clothing: 30%** | Same as above | Same query with different category |
| **Food: 15%** | Same as above | Same query with different category |
| **Other: 10%** | Same as above | Same query with different category |

### Recent Transactions

| Static Data | Database Source | Query |
|-------------|----------------|-------|
| **Order #12345, John Doe, $299.99** | `orders → profiles → order_items → products` | `SELECT orders.id, profiles.name, products.name, orders.total_amount, orders.status, orders.created_at FROM orders JOIN profiles ON orders.user_id = profiles.id JOIN order_items ON orders.id = order_items.order_id JOIN products ON order_items.product_id = products.id ORDER BY orders.created_at DESC LIMIT 10` |

### Weekly Revenue Chart

| Static Data | Database Source | Query |
|-------------|----------------|-------|
| **Daily Revenue (Mon-Sun)** | `orders.total_amount, created_at` | `SELECT EXTRACT(DOW FROM created_at) as day, SUM(total_amount) FROM orders WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '7 days' GROUP BY EXTRACT(DOW FROM created_at) ORDER BY day` |

## 🎯 Admin ID Integration

### Admin User: `09bd3487-7e50-42c1-a3eb-edaa5f6743f1`

**Database Query to Verify Admin:**
```sql
SELECT * FROM profiles 
WHERE id = '09bd3487-7e50-42c1-a3eb-edaa5f6743f1' 
AND role = 'admin' AND is_active = true;
```

**RLS Policy for Admin Access:**
```sql
CREATE POLICY "admin_full_access" ON public."profiles"
  FOR ALL
  TO authenticated
  USING (
    (SELECT auth.uid()) = '09bd3487-7e50-42c1-a3eb-edaa5f6743f1' 
    OR (SELECT auth.uid()) = id
  );
```

## 📋 Missing Tables (Need to Create)

### 1. **orders** Table
```sql
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_orders" ON public."orders"
  FOR ALL USING ( (SELECT auth.uid()) = user_id );

CREATE POLICY "admin_full_orders_access" ON public."orders"
  FOR ALL USING ( (SELECT auth.uid()) = '09bd3487-7e50-42c1-a3eb-edaa5f6743f1' );
```

### 2. **order_items** Table
```sql
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_access" ON public."order_items"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND ((SELECT auth.uid()) = orders.user_id OR (SELECT auth.uid()) = '09bd3487-7e50-42c1-a3eb-edaa5f6743f1')
    )
  );
```

## 🔗 Service Layer Mapping

### DashboardStatsService → Database Queries

| Service Method | Database Query | Returns |
|----------------|----------------|---------|
| `getTotalUsers()` | `SELECT COUNT(*) FROM profiles WHERE role = 'user'` | `number` |
| `getTotalSellers()` | `SELECT COUNT(*) FROM profiles WHERE role = 'seller'` | `number` |
| `getTotalRevenue()` | `SELECT SUM(total_amount) FROM orders WHERE status = 'completed'` | `number` |
| `getRecentTransactions()` | Complex JOIN query | `RecentTransaction[]` |
| `getRevenueByCategory()` | Complex JOIN with GROUP BY | `CategoryRevenue[]` |
| `getWeeklyRevenue()` | Date-based aggregation | `{day: string, revenue: number}[]` |

## 🚀 Implementation Priority

### Phase 1: Core Tables (High Priority)
1. ✅ `profiles` - Already exists
2. ✅ `products` - Already exists  
3. 🔄 `orders` - Need to create
4. 🔄 `order_items` - Need to create

### Phase 2: Data Migration (Medium Priority)
1. Create sample orders for testing
2. Create sample order_items
3. Populate with realistic data

### Phase 3: Advanced Features (Low Priority)
1. Add `reviews` table
2. Add `payments` table
3. Add `shipping` table

## 📊 Real-Time Data Flow

```
User Registration → profiles table
Product Creation → products table  
Order Placement → orders + order_items tables
Dashboard Stats → Live queries from all tables
Admin Access → RLS policies with admin ID check
```

## 🎯 Next Steps

1. **Create missing tables** (`orders`, `order_items`)
2. **Update RLS policies** for admin access
3. **Test database connections** in the dashboard
4. **Populate sample data** for realistic dashboard
5. **Verify admin ID** `09bd3487-7e50-42c1-a3eb-edaa5f6743f1` has proper permissions

This mapping ensures all static dashboard data is replaced with real, dynamic database queries while maintaining proper security and performance.
