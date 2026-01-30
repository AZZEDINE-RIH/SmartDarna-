# 🔐 FIX: Enable Users to Read Their Own Profile

## The Problem

Your profiles table has RLS policies that **block authenticated users** from reading even their own profile data. This causes:
- 403 Forbidden error when fetching profile
- User role cannot be determined
- Login fails without proper role-based redirect

## The Solution

Go to your **Supabase Dashboard** and run this SQL in the SQL Editor:

```sql
-- ===== ENABLE RLS =====
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ===== DROP EXISTING POLICIES (if any) =====
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- ===== CREATE NEW POLICIES =====

-- 1. Allow users to SELECT their own profile (READ)
CREATE POLICY "Users can read their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- 2. Allow users to INSERT their own profile (during registration)
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 3. Allow users to UPDATE their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Optional: Allow admins to do anything
CREATE POLICY "Admin can manage all profiles"
ON profiles
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
```

## Step-by-Step Guide

### 1. Open Supabase Dashboard
Go to: https://app.supabase.com

### 2. Navigate to SQL Editor
- Click your project
- Left sidebar → **SQL Editor**
- Click **New Query**

### 3. Copy & Paste the SQL above

### 4. Click **Run** or press **Ctrl+Enter**

### 5. Verify the policies were created
- Go to **Authentication** → **Policies**
- Select `profiles` table
- You should see the 4 new policies

---

## What These Policies Do

| Policy | Action | Who | Condition |
|--------|--------|-----|-----------|
| **Users can read their own profile** | SELECT | Any authenticated user | `auth.uid() = id` |
| **Users can insert their own profile** | INSERT | Any authenticated user | `auth.uid() = id` |
| **Users can update their own profile** | UPDATE | Any authenticated user | `auth.uid() = id` |
| **Admin can manage all profiles** | ALL | Users with role='admin' | Admin check |

---

## Test After Applying

1. Clear browser cache: **Ctrl+Shift+Delete**
2. Go to login page: `http://localhost:4200/login`
3. Enter credentials for:
   - **User account** → Should redirect to `/home`
   - **Seller account** → Should redirect to `/vendeur-dashboard`
   - **Admin account** → Should redirect to `/dashboard/overview`

---

## What to Look for in Console

✅ **Success:**
```
🔍 Authenticating session detected
🔍 Loading profile for userId: {id}
🔍 Session verified, querying profiles...
🔍 Profile loaded successfully: {name, role, email...}
🔍 Normalized role: user/seller/admin
🔍 Sign in successful
🔍 Redirecting to dashboard. Role: user/seller/admin
🔍 Navigating to [appropriate dashboard]
```

❌ **Still Failing:**
```
🔍 Profile query result: {profileData: null, profileError: {...}}
🔍 Error loading user profile: 403 Forbidden
🔍 Profile fetch failed - RLS policies may be blocking access
```

If still failing after applying policies:
1. Refresh page completely: **Ctrl+Shift+R**
2. Clear localStorage: DevTools → Application → Storage → Clear All
3. Check if policies were applied: Supabase → Policies tab
4. Verify policy syntax in SQL Editor

---

## Verify Profile Table Data

Make sure your `profiles` table has the correct structure:

```sql
-- Check if profiles table exists and has data
SELECT * FROM profiles LIMIT 5;

-- Check columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Expected columns:
-- id (uuid, primary key)
-- email (text)
-- name (text)
-- role (text) - should be 'user', 'seller', or 'admin'
-- is_active (boolean)
```

---

## If Policies Still Don't Work

Try this more permissive version (for testing):

```sql
-- TEMPORARY: Very permissive (for testing only)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- After testing works, re-enable with proper policies above
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## Expected Behavior After Fix

### Login Flow:
```
User enters email & password
         ↓
Supabase Auth verifies credentials ✓
         ↓
Profile fetched from profiles table ✓ (RLS allows it)
         ↓
Role determined from profile data ✓
         ↓
Redirect to appropriate dashboard ✓
         ↓
User sees dashboard
```

### Example Redirects:
- Email: `user@example.com` (role: user) → `/home`
- Email: `seller@example.com` (role: seller) → `/vendeur-dashboard`
- Email: `admin@example.com` (role: admin) → `/dashboard/overview`

---

## Important Notes

- ⚠️ **auth.uid()** is a Supabase function that returns the current authenticated user's ID
- ✅ These policies ensure users can ONLY access their own data
- ✅ Admins can access all profiles (if they have role='admin')
- 🔒 No security bypass - authenticated users still required

---

## Support

If you get any SQL errors:
1. Copy the exact error message
2. Check that `profiles` table exists
3. Verify column names match (id, role, etc.)
4. Make sure RLS is enabled: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`

---

**After applying these policies, your authentication will work with proper role-based redirection!**
