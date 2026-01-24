# 📊 How to View Registration Data in Supabase

## Step-by-Step Guide

### 1. **Access Your Supabase Dashboard**

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Click on your project: **smartDarna**

---

### 2. **Navigate to the Tables**

Once you're in your project:

**Left Sidebar Menu:**
```
Database
  ├── Tables
  └── [Your Tables Listed Here]
```

Click on **Tables** to see all your database tables.

---

### 3. **View User Profiles**

#### Option A: Via Dashboard (Easiest)

1. In the left sidebar, click **Tables**
2. Click on the **profiles** or **users** table
3. You'll see all registered users displayed in a grid view
4. Columns will show: `id`, `email`, `name`, `role`, `created_at`

**Example View:**
```
ID                          | Email              | Name        | Role  | Created At
b8f3c8e4-...               | user@example.com   | John Doe    | user  | 2026-01-22
a2d9e5f1-...               | seller@example.com | Jane Smith  | user  | 2026-01-22
```

#### Option B: Via SQL Editor

1. Click **SQL Editor** in the left sidebar
2. Paste this query:

```sql
SELECT id, email, name, role, created_at 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 50;
```

3. Click **Run** (or Ctrl + Enter)
4. View results below

---

### 4. **First Time Setup: Create the Profiles Table**

If you don't see the `profiles` table, create it:

1. Click **SQL Editor** in sidebar
2. Copy and paste this SQL:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can read their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policy for service role to insert profiles
CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);
```

3. Click **Run**
4. Click **Yes, update schema**

---

### 5. **Monitor Real-Time Registration**

**Watch live as users register:**

1. Open **Table Editor** (click on profiles table)
2. Keep this window open
3. When a user registers through your app, you'll see the new row appear in real-time! 🚀

---

### 6. **Test Your Registration**

Test flow with browser console:

1. Open your app: `http://localhost:4200`
2. Go to **Register** page
3. Fill in form with test data:
   - **Full Name:** John Doe
   - **Email:** john@example.com
   - **Password:** test123456
   - **Confirm:** test123456
4. Click **Sign Up**
5. Watch for success message
6. Check Supabase dashboard → **profiles table**
7. You should see the new user row!

**Console Output (Browser DevTools):**
```
✅ User registered successfully: {data: {...}}
```

---

### 7. **Check Both Auth and Database**

#### Auth Tab (User Authentication)
1. Click **Authentication** in sidebar
2. Click **Users** tab
3. See all registered users with their auth IDs

**Shows:**
- Email
- User ID (UUID)
- Sign Up Date
- Last Sign In

#### Profiles Table (User Data)
1. Click **Tables** in sidebar
2. Click **profiles**
3. See all user profile data

**Shows:**
- Name
- Role
- Created Date
- Any custom fields

---

### 8. **Debugging Registration Issues**

If data doesn't appear:

**Check Browser Console:**
```typescript
// Look for these messages:
✅ User registered successfully: [data shows]
❌ Registration error: [error shows]
```

**Check Supabase Logs:**
1. Click **Logs** in sidebar
2. Look for errors in the last 5 minutes
3. Common errors:
   - `Email already exists` - User already registered
   - `Invalid email` - Email validation issue
   - `RLS policy violation` - Permission issue

---

### 9. **View All Registration Activity**

**SQL Query to see all registrations:**

```sql
-- All registrations today
SELECT 
  id,
  email,
  name,
  role,
  created_at,
  NOW() - created_at as "time_ago"
FROM public.profiles
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

**Or in the Dashboard:**
- Filter by date
- Sort by most recent
- Search by email or name

---

### 10. **Real-Time Data Example**

After 3 users register, your profiles table will look like:

| ID | Email | Name | Role | Created At |
|----|-------|------|------|-----------|
| `uuid-1` | user1@test.com | Alice Smith | user | Jan 22, 2026 10:30 |
| `uuid-2` | user2@test.com | Bob Jones | user | Jan 22, 2026 10:35 |
| `uuid-3` | user3@test.com | Carol White | user | Jan 22, 2026 10:40 |

---

## 🔍 Troubleshooting

### Problem: Registration succeeds but no data in Supabase

**Solution:**
1. Check if `profiles` table exists
2. Verify RLS policies are set correctly
3. Check browser console for errors
4. Check Supabase Logs for SQL errors

### Problem: "User already exists" error

**Solution:**
- Use a different email address
- Or delete the user from Auth → Users tab first

### Problem: Can't see the data

**Solution:**
- Refresh the page (Cmd/Ctrl + R)
- Check that you're looking at the right table
- Make sure RLS policies allow you to see the data

---

## 📱 Quick Reference Commands

**View all users:**
```sql
SELECT * FROM public.profiles;
```

**Count registrations:**
```sql
SELECT COUNT(*) as total_users FROM public.profiles;
```

**Find user by email:**
```sql
SELECT * FROM public.profiles WHERE email = 'user@example.com';
```

**Delete user (admin only):**
```sql
DELETE FROM public.profiles WHERE email = 'user@example.com';
```

---

## ✅ What Should Happen

1. **User fills form** → Types name, email, password
2. **Clicks Sign Up** → Form validates
3. **Backend registers** → Data sent to Supabase
4. **User record created** → Appears in `auth.users`
5. **Profile created** → Appears in `profiles` table ✅
6. **Success message** → Shows on screen
7. **Redirects to login** → User can now log in

---

## 📞 Next Steps

After confirming registration works:

1. ✅ Test login with registered credentials
2. ✅ Create login page to use Supabase auth
3. ✅ Set up role-based access (admin/user/vendor)
4. ✅ Create tables for products, orders, etc.
5. ✅ Connect dashboard to real data

Your registration is now **LIVE and connected to Supabase**! 🎉
