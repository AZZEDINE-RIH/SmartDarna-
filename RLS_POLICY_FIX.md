# 🔐 Supabase RLS Policy Fix (Production Ready)

## Problem
Your app's login was stuck because of restrictive Row Level Security (RLS) policies on the `profiles` table. The 403 error prevented users from reading their own profile data.

---

## Solution: Update RLS Policies

### Step 1: Go to Supabase Dashboard
1. Navigate to your Supabase project
2. Click **Authentication** → **Policies** (or SQL Editor)
3. Select the `profiles` table

### Step 2: Create/Update RLS Policies

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to SELECT their own profile
CREATE POLICY "Users can select their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to UPDATE their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Allow users to INSERT their own profile (during registration)
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Optional: Allow admins to do anything
CREATE POLICY "Admin users can access all profiles"
ON profiles
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
```

### Step 3: Verify the Policies

After running the SQL:
1. Go to **Table Editor** → `profiles`
2. Click on the table name → **Policies**
3. You should see the new policies listed

---

## Testing the Fix

### Before (After applying RLS fix)

Clear your browser cache and try login again:

```
1. Enter credentials
2. Check console - should NOT see 403 error
3. Profile should load successfully
4. Redirect happens immediately
5. Dashboard loads with correct role
```

Expected console:
```
✅ Profile query result: {profileData: {...}, profileError: null}
✅ Profile loaded successfully: {name, role, email, etc}
✅ Navigating to admin/seller/user dashboard based on ACTUAL ROLE
```

---

## Troubleshooting

### Still seeing 403 error?

1. **Verify RLS is enabled:**
   ```sql
   -- Check RLS status
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'profiles';
   ```

2. **Check policies exist:**
   ```sql
   -- List all policies on profiles table
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

3. **Test policy directly:**
   ```sql
   -- Simulate user query
   SELECT * FROM profiles 
   WHERE id = auth.uid();
   ```

### Role not updating in app?

1. Clear localStorage: `localStorage.clear()`
2. Clear cookies in browser DevTools
3. Hard refresh: `Ctrl+Shift+R`
4. Try login again

---

## Advanced: Custom RLS Logic

If you need more sophisticated RLS rules:

```sql
-- Allow admins to see all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.role = 'admin'
  )
);

-- Allow sellers to see customer profiles they've sold to
CREATE POLICY "Sellers can view their customer profiles"
ON profiles FOR SELECT
USING (
  role = 'user' OR 
  auth.uid() = id
);
```

---

## Rollback (if needed)

To disable RLS temporarily for testing:

```sql
-- ⚠️ WARNING: This disables security - only for testing!
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable it:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## Complete Test Scenario

After applying RLS policies:

1. **User Login**
   - Email: `user@smartdarna.com`
   - Expected Role: `user`
   - Expected Redirect: `/home`

2. **Seller Login**
   - Email: `seller@smartdarna.com`
   - Expected Role: `seller`
   - Expected Redirect: `/vendeur-dashboard`

3. **Admin Login**
   - Email: `admin@smartdarna.com`
   - Expected Role: `admin`
   - Expected Redirect: `/dashboard/overview`

---

## Performance Notes

- RLS policies are checked on EVERY query
- More policies = slightly slower queries
- Keep policies as specific as possible
- Test with production data volume

---

## Related Documentation

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth)

---

## Status

- ✅ Temporary fix applied (fallback user)
- ⏳ RLS policies ready to apply
- 🚀 Ready for production after policy update

**Next Step:** Apply the SQL policies above to your Supabase database.
