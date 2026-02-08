# Supabase Integration Guide

## Setup Complete ✅

Your project is now connected to Supabase! Here's how to use it:

## 📁 New Files Created

1. **Environment Configuration**
   - `/src/environments/environment.ts` - Development config
   - `/src/environments/environment.prod.ts` - Production config

2. **Services**
   - `/src/app/services/supabase.service.ts` - Low-level Supabase operations
   - `/src/app/services/supabase-auth.service.ts` - Authentication with user profiles

## 🔧 Services Overview

### SupabaseService
Low-level service for direct database operations.

**Methods:**
- `getClient()` - Get the Supabase client directly
- `getAuthState()` - Get auth state as Observable
- `getCurrentUser()` - Get current authenticated user
- `signUp(email, password)` - Sign up user
- `signIn(email, password)` - Sign in user
- `signOut()` - Sign out user

**Database Operations (Users, Products, Orders):**
- `get<Table>()` - Get all records
- `get<Table>ById(id)` - Get single record
- `create<Table>(data)` - Create record
- `update<Table>(id, updates)` - Update record
- `delete<Table>(id)` - Delete record

**Generic Method:**
```typescript
query(table, operation, data?, filters?)
```

### SupabaseAuthService
High-level authentication service with user profile management.

**Methods:**
```typescript
// Authentication
async signUp(email, password, name, role?)
async signIn(email, password)
async signOut()

// User Management
getCurrentUser(): Observable<LoggedInUser | null>
getCurrentUserValue(): LoggedInUser | null
isLoggedIn(): boolean
getUserRole(): string | null

// Role Checking
hasRole(role: string): boolean
hasAnyRole(roles: string[]): boolean

// Profile Updates
async updateProfile(updates: Partial<LoggedInUser>)
```

## 📝 Usage Examples

### In Components

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-example',
  template: `...`
})
export class ExampleComponent implements OnInit {
  private authService = inject(SupabaseAuthService);
  private supabaseService = inject(SupabaseService);

  currentUser$ = this.authService.getCurrentUser();

  async ngOnInit() {
    // Sign up
    const signUpResult = await this.authService.signUp(
      'user@example.com',
      'password123',
      'John Doe',
      'user'
    );

    // Sign in
    const signInResult = await this.authService.signIn(
      'user@example.com',
      'password123'
    );

    // Get products
    const { data: products } = await this.supabaseService.getProducts();

    // Create product
    const { data: newProduct } = await this.supabaseService.createProduct({
      name: 'Product Name',
      price: 99.99,
      description: 'Product description'
    });

    // Get orders
    const { data: orders } = await this.supabaseService.getOrders();

    // Check user role
    if (this.authService.hasRole('admin')) {
      // Admin only code
    }

    // Sign out
    await this.authService.signOut();
  }
}
```

### Real-time Subscriptions

```typescript
import { SupabaseService } from '../../services/supabase.service';

export class RealtimeComponent {
  private supabaseService = inject(SupabaseService);

  ngOnInit() {
    const client = this.supabaseService.getClient();
    
    // Subscribe to changes
    const subscription = client
      .from('products')
      .on('*', (payload) => {
        console.log('Change received!', payload);
      })
      .subscribe();

    // Cleanup
    this.ngOnDestroy() {
      subscription.unsubscribe();
    }
  }
}
```

## 🗄️ Supabase Tables to Create

Before using the services, create these tables in your Supabase dashboard:

### Users Table
```sql
create table public.users (
  id uuid primary key,
  email text unique not null,
  name text not null,
  role text default 'user',
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

### Products Table
```sql
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price decimal(10, 2),
  stock integer default 0,
  seller_id uuid references public.users(id),
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

### Orders Table
```sql
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  product_id uuid references public.products(id),
  quantity integer default 1,
  total_price decimal(10, 2),
  status text default 'pending',
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

## 🔐 Security Notes

⚠️ **Important:** The credentials in `environment.ts` are using the anonymous key. For production:

1. Implement proper authentication with Supabase Auth
2. Use Row Level Security (RLS) policies
3. Create service role key for server operations
4. Never commit real keys to version control

## 🎯 Next Steps

1. Create tables in Supabase dashboard (see SQL above)
2. Test authentication with your login/register components
3. Implement data operations in your components
4. Set up RLS policies for security
5. Add error handling and loading states

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Angular Integration](https://supabase.com/docs/guides/getting-started/quickstarts/angular)
