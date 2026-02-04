-- Sub Admin Permissions + Settings (idempotent)
-- Run in Supabase SQL editor

-- 1) Helper: super admin check
CREATE TABLE IF NOT EXISTS public.super_admins (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
 SECURITY DEFINER
 SET search_path = public
AS $$
  SELECT
    (auth.uid() IS NOT NULL)
    AND (
      lower(coalesce(auth.jwt() ->> 'email', '')) = 'sarajamal02@gmail.com'
      OR EXISTS (
        SELECT 1
        FROM public.super_admins sa
        WHERE sa.user_id = auth.uid()
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.has_admin_permission(required_permission text)
RETURNS boolean
LANGUAGE sql
STABLE
 SECURITY DEFINER
 SET search_path = public
AS $$
  SELECT
    (auth.uid() IS NOT NULL)
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.sub_admin_permissions p
        WHERE p.admin_id = auth.uid()
          AND p.permission = required_permission
      )
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_admin_permission(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.order_is_customer(order_id uuid, uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = order_id
      AND (o.customer_id = uid OR o.user_id = uid)
  );
$$;

CREATE OR REPLACE FUNCTION public.product_is_seller(product_id uuid, uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = product_id
      AND p.seller_id = uid
  );
$$;

CREATE OR REPLACE FUNCTION public.order_has_seller(order_id uuid, uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = order_id
      AND p.seller_id = uid
  );
$$;

GRANT EXECUTE ON FUNCTION public.order_is_customer(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.product_is_seller(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.order_has_seller(uuid, uuid) TO authenticated;

ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.super_admins TO authenticated;

DROP POLICY IF EXISTS "super_admins_read_self_or_super" ON public.super_admins;
DROP POLICY IF EXISTS "super_admins_manage_super_only" ON public.super_admins;

CREATE POLICY "super_admins_read_self_or_super" ON public.super_admins
  FOR SELECT
  TO authenticated
  USING (public.is_super_admin() OR user_id = auth.uid());

CREATE POLICY "super_admins_manage_super_only" ON public.super_admins
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());


-- 2) Sub-admin permissions table
CREATE TABLE IF NOT EXISTS public.sub_admin_permissions (
  admin_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (admin_id, permission)
);

-- Keep the permission values controlled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sub_admin_permissions_permission_check'
  ) THEN
    ALTER TABLE public.sub_admin_permissions
      ADD CONSTRAINT sub_admin_permissions_permission_check
      CHECK (permission IN (
        'manage_products',
        'manage_users',
        'manage_sellers',
        'manage_orders',
        'view_analytics'
      ));
  END IF;
END $$;

ALTER TABLE public.sub_admin_permissions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sub_admin_permissions TO authenticated;

DROP POLICY IF EXISTS "sub_admin_permissions_read_own_or_super" ON public.sub_admin_permissions;
DROP POLICY IF EXISTS "sub_admin_permissions_manage_super_only" ON public.sub_admin_permissions;

CREATE POLICY "sub_admin_permissions_read_own_or_super" ON public.sub_admin_permissions
  FOR SELECT
  TO authenticated
  USING (public.is_super_admin() OR admin_id = auth.uid());

CREATE POLICY "sub_admin_permissions_manage_super_only" ON public.sub_admin_permissions
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());


ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_admin_read" ON public.profiles;

CREATE POLICY "profiles_admin_read" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR public.is_super_admin()
    OR public.has_admin_permission('manage_users')
    OR public.has_admin_permission('manage_orders')
    OR public.has_admin_permission('manage_sellers')
  );


-- 2b) Allow admin operations on core tables based on permissions

-- sellers
ALTER TABLE IF EXISTS public.sellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sellers_admin_manage" ON public.sellers;
CREATE POLICY "sellers_admin_manage" ON public.sellers
  FOR UPDATE
  TO authenticated
  USING (public.has_admin_permission('manage_sellers'))
  WITH CHECK (public.has_admin_permission('manage_sellers'));

-- orders
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_admin_manage" ON public.orders;
CREATE POLICY "orders_admin_manage" ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.has_admin_permission('manage_orders'))
  WITH CHECK (public.has_admin_permission('manage_orders'));

-- products
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_admin_manage" ON public.products;
CREATE POLICY "products_admin_manage" ON public.products
  FOR ALL
  TO authenticated
  USING (public.has_admin_permission('manage_products'))
  WITH CHECK (public.has_admin_permission('manage_products'));


-- 3) App Settings (singleton)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id int PRIMARY KEY DEFAULT 1,
  platform_name text NOT NULL DEFAULT 'SmartDarna',
  commission_rate numeric(6,2) NOT NULL DEFAULT 0,
  maintenance_mode boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'app_settings_singleton'
  ) THEN
    ALTER TABLE public.app_settings
      ADD CONSTRAINT app_settings_singleton
      CHECK (id = 1);
  END IF;
END $$;

INSERT INTO public.app_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.touch_app_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER trg_touch_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_app_settings_updated_at();

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public.app_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.app_settings TO authenticated;

DROP POLICY IF EXISTS "app_settings_read_all" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_manage_super_only" ON public.app_settings;

CREATE POLICY "app_settings_read_all" ON public.app_settings
  FOR SELECT
  USING (true);

CREATE POLICY "app_settings_manage_super_only" ON public.app_settings
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());


ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS customer_id uuid;

ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE OR REPLACE FUNCTION public.sync_orders_customer_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.customer_id IS NULL AND NEW.user_id IS NOT NULL THEN
    NEW.customer_id := NEW.user_id;
  ELSIF NEW.user_id IS NULL AND NEW.customer_id IS NOT NULL THEN
    NEW.user_id := NEW.customer_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_orders_customer_fields ON public.orders;
CREATE TRIGGER trg_sync_orders_customer_fields
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_orders_customer_fields();


CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  method text,
  status text,
  transaction_id text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  old_status text,
  new_status text,
  note text,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_status_history TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_items TO authenticated;


CREATE OR REPLACE FUNCTION public.orders_validate_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IS NULL THEN
    NEW.status := OLD.status;
    RETURN NEW;
  END IF;

  IF OLD.status IN ('completed', 'cancelled') AND NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'Cannot change status from %', OLD.status;
  END IF;

  IF OLD.status = 'pending' AND NEW.status NOT IN ('pending', 'processing', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid transition from % to %', OLD.status, NEW.status;
  END IF;

  IF OLD.status = 'processing' AND NEW.status NOT IN ('processing', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid transition from % to %', OLD.status, NEW.status;
  END IF;

  IF OLD.status = 'completed' AND NEW.status <> 'completed' THEN
    RAISE EXCEPTION 'Invalid transition from % to %', OLD.status, NEW.status;
  END IF;

  IF OLD.status = 'cancelled' AND NEW.status <> 'cancelled' THEN
    RAISE EXCEPTION 'Invalid transition from % to %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_validate_status_transition ON public.orders;
CREATE TRIGGER trg_orders_validate_status_transition
  BEFORE UPDATE OF status ON public.orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.orders_validate_status_transition();


CREATE OR REPLACE FUNCTION public.orders_log_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.order_status_history (order_id, changed_by, old_status, new_status)
  VALUES (NEW.id, auth.uid(), OLD.status, NEW.status);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_log_status_change ON public.orders;
CREATE TRIGGER trg_orders_log_status_change
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.orders_log_status_change();


ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view orders for their products" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "users_manage_own_orders" ON public.orders;
DROP POLICY IF EXISTS "admin_full_orders_access" ON public.orders;
DROP POLICY IF EXISTS "view_order_status" ON public.orders;

DROP POLICY IF EXISTS "order_items_access" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Sellers can view order items for their products" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;


DROP POLICY IF EXISTS "orders_read_scoped" ON public.orders;
CREATE POLICY "orders_read_scoped" ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    public.has_admin_permission('manage_orders')
    OR auth.uid() = customer_id
    OR auth.uid() = user_id
    OR public.order_has_seller(orders.id, auth.uid())
  );

DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = customer_id
    OR auth.uid() = user_id
  );


DROP POLICY IF EXISTS "order_items_read_scoped" ON public.order_items;
CREATE POLICY "order_items_read_scoped" ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    public.has_admin_permission('manage_orders')
    OR public.order_is_customer(order_items.order_id, auth.uid())
    OR public.product_is_seller(order_items.product_id, auth.uid())
  );

DROP POLICY IF EXISTS "order_items_insert_own" ON public.order_items;
CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.order_is_customer(order_items.order_id, auth.uid())
  );


DROP POLICY IF EXISTS "payments_read_scoped" ON public.payments;
CREATE POLICY "payments_read_scoped" ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    public.has_admin_permission('manage_orders')
    OR public.order_is_customer(payments.order_id, auth.uid())
    OR public.order_has_seller(payments.order_id, auth.uid())
  );

DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_admin_permission('manage_orders')
    OR public.order_is_customer(payments.order_id, auth.uid())
  );

DROP POLICY IF EXISTS "payments_admin_manage" ON public.payments;
CREATE POLICY "payments_admin_manage" ON public.payments
  FOR UPDATE
  TO authenticated
  USING (public.has_admin_permission('manage_orders'))
  WITH CHECK (public.has_admin_permission('manage_orders'));

DROP POLICY IF EXISTS "payments_admin_delete" ON public.payments;
CREATE POLICY "payments_admin_delete" ON public.payments
  FOR DELETE
  TO authenticated
  USING (public.has_admin_permission('manage_orders'));


DROP POLICY IF EXISTS "order_status_history_read_scoped" ON public.order_status_history;
CREATE POLICY "order_status_history_read_scoped" ON public.order_status_history
  FOR SELECT
  TO authenticated
  USING (
    public.has_admin_permission('manage_orders')
    OR public.order_is_customer(order_status_history.order_id, auth.uid())
    OR public.order_has_seller(order_status_history.order_id, auth.uid())
  );

DROP POLICY IF EXISTS "order_status_history_insert_admin" ON public.order_status_history;
CREATE POLICY "order_status_history_insert_admin" ON public.order_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_admin_permission('manage_orders'));
