# SmartDarna Authentication System

A complete static authentication system for Angular 20 with role-based access control, perfect for student e-commerce projects.

## 🎯 Features

✅ **No Backend Required** - Fully static authentication with hardcoded users  
✅ **Three User Roles** - User, Vendeur (Seller), Admin with role-based routing  
✅ **AuthService** - Centralized authentication logic with localStorage persistence  
✅ **AuthGuard** - Protects routes from unauthenticated access  
✅ **RoleGuard** - Restricts routes based on user roles  
✅ **Role-Based Dashboards** - Separate dashboards for each role  
✅ **Auto-Redirect** - Automatically redirects logged-in users to their dashboard  
✅ **Clean & Simple** - Suitable for learning and student projects  

## 📁 Project Structure

```
src/
├── app/
│   ├── services/
│   │   └── auth.service.ts          # Core authentication service
│   ├── guards/
│   │   ├── auth.guard.ts            # Protects authenticated routes
│   │   └── role.guard.ts            # Protects role-based routes
│   ├── dashboard/
│   │   ├── home/                    # User dashboard
│   │   │   ├── home.ts
│   │   │   ├── home.html
│   │   │   └── home.css
│   │   ├── vendeur-dashboard/       # Seller dashboard
│   │   │   ├── vendeur-dashboard.ts
│   │   │   ├── vendeur-dashboard.html
│   │   │   └── vendeur-dashboard.css
│   │   └── admin-dashboard/         # Admin dashboard
│   │       ├── admin-dashboard.ts
│   │       ├── admin-dashboard.html
│   │       └── admin-dashboard.css
│   ├── app.routes.ts                # Route configuration with guards
│   ├── app.ts                       # Main app component
│   ├── app.html                     # App template with navbar
│   └── app.css                      # App styles
├── Auth/
│   └── login/
│       ├── login.ts                 # Login component
│       ├── login.html               # Login form
│       └── login.css                # Login styles
```

## 🔐 Authentication Flow

1. **User visits `/login`** (default redirect from `/`)
2. **AuthService checks localStorage** for existing session
   - If logged in → Auto-redirect to appropriate dashboard
   - If not logged in → Show login form
3. **User enters credentials** (email + password)
4. **AuthService validates** against hardcoded users
5. **On success:**
   - User data stored in localStorage
   - Redirect based on role:
     - `user` → `/home`
     - `vendeur` → `/vendeur-dashboard`
     - `admin` → `/admin-dashboard`
6. **AuthGuard** protects all dashboards
7. **RoleGuard** ensures role-based access
8. **Logout** clears localStorage and redirects to login

## 🔑 Hardcoded Test Users

All passwords are `password123`:

| Email | Password | Role | Dashboard |
|-------|----------|------|-----------|
| user@example.com | password123 | user | /home |
| vendeur@example.com | password123 | vendeur | /vendeur-dashboard |
| admin@example.com | password123 | admin | /admin-dashboard |

## 📚 API Reference

### AuthService

```typescript
// Login with email and password
login(email: string, password: string): LoggedInUser | null

// Logout current user
logout(): void

// Check if user is logged in
isLoggedIn(): boolean

// Get current logged-in user
getUser(): LoggedInUser | null

// Get current user's role
getUserRole(): string | null

// Check if user has specific role
hasRole(role: string): boolean

// Check if user has any of specified roles
hasAnyRole(roles: string[]): boolean
```

### LoggedInUser Interface

```typescript
interface LoggedInUser {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'vendeur' | 'admin';
}
```

## 🛣️ Routing Configuration

Routes are defined in `src/app/app.routes.ts`:

```typescript
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['user'] }
  },
  {
    path: 'vendeur-dashboard',
    component: VendeurDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['vendeur'] }
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  }
];
```

## 🔒 Using Guards in Your Own Routes

To protect a route with authentication:

```typescript
{
  path: 'protected-page',
  component: ProtectedComponent,
  canActivate: [AuthGuard]
}
```

To protect with role-based access:

```typescript
{
  path: 'admin-only',
  component: AdminComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['admin'] }  // Can specify multiple roles
}
```

## 💾 localStorage Structure

When user logs in, their data is stored:

```json
{
  "currentUser": {
    "id": 1,
    "email": "user@example.com",
    "name": "John User",
    "role": "user"
  }
}
```

Session persists across page refreshes and browser restarts.

## 🎨 Dashboard Components

Each dashboard component:
- Displays user information
- Shows role-specific features
- Has a logout button (via navbar)
- Uses responsive design
- Styled with modern gradient background

### User Dashboard (`/home`)
- Browse products and categories
- View orders
- Manage profile
- Leave reviews

### Vendeur Dashboard (`/vendeur-dashboard`)
- Store statistics (products, sales, orders, rating)
- Add and manage products
- Manage inventory
- View analytics

### Admin Dashboard (`/admin-dashboard`)
- Platform statistics (users, sellers, revenue, orders)
- Manage all users and sellers
- Monitor platform activity
- System management

## 🔄 How to Extend

### Add a New User

Edit `src/app/services/auth.service.ts`:

```typescript
private users: User[] = [
  // ... existing users
  {
    id: 4,
    email: 'newuser@example.com',
    password: 'password123',
    name: 'New User',
    role: 'user'
  }
];
```

### Create a New Protected Route

```typescript
// 1. Create your component
// 2. Add to routing:
{
  path: 'new-page',
  component: NewComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['admin', 'vendeur'] }  // Multiple roles OK
}
```

### Check Authentication in Components

```typescript
import { AuthService } from './services/auth.service';

export class MyComponent {
  constructor(private authService: AuthService) {}

  isAdmin() {
    return this.authService.hasRole('admin');
  }

  currentUser = this.authService.getUser();
}
```

## ⚠️ Important Notes

⚠️ **For Development Only** - This is a static auth system, not for production  
⚠️ **No API Calls** - All authentication is client-side  
⚠️ **No Database** - User data is hardcoded in the service  
⚠️ **Clear localStorage** - Credentials visible in browser storage  

## 🚀 Quick Start

1. **Run the application:**
   ```bash
   npm start
   ```

2. **Visit `http://localhost:4200`**

3. **You'll be redirected to `/login`**

4. **Try demo credentials:**
   - Email: `admin@example.com`
   - Password: `password123`

5. **You'll be redirected to `/admin-dashboard`**

## 🧪 Testing All Flows

```bash
# Test user login
# Email: user@example.com, Password: password123
# → Should redirect to /home

# Test vendeur login
# Email: vendeur@example.com, Password: password123
# → Should redirect to /vendeur-dashboard

# Test admin login
# Email: admin@example.com, Password: password123
# → Should redirect to /admin-dashboard

# Test unauthorized access
# Try accessing /admin-dashboard as user
# → Should redirect to /home

# Test logout
# Click "Logout" in navbar
# → Should redirect to /login
```

## 📝 File Modifications Summary

Created/Modified files:
- ✅ `src/app/services/auth.service.ts` - New
- ✅ `src/app/guards/auth.guard.ts` - New
- ✅ `src/app/guards/role.guard.ts` - New
- ✅ `src/Auth/login/login.ts` - Modified
- ✅ `src/Auth/login/login.html` - Modified
- ✅ `src/Auth/login/login.css` - Created
- ✅ `src/app/dashboard/home/` - New
- ✅ `src/app/dashboard/vendeur-dashboard/` - New
- ✅ `src/app/dashboard/admin-dashboard/` - New
- ✅ `src/app/app.routes.ts` - Modified
- ✅ `src/app/app.ts` - Modified
- ✅ `src/app/app.html` - Modified
- ✅ `src/app/app.css` - Created

## 🎓 Learning Objectives

This project demonstrates:
- ✓ Angular Services and Dependency Injection
- ✓ Route Guards (CanActivate)
- ✓ Angular Forms and Two-Way Binding
- ✓ Signal-based State Management
- ✓ localStorage API
- ✓ Role-Based Access Control (RBAC)
- ✓ Component Communication
- ✓ TypeScript Interfaces and Types
- ✓ CSS Styling and Responsive Design
- ✓ Angular Routing and Navigation

## 🤝 Next Steps

To build on this foundation:

1. **Connect to Backend API** - Replace hardcoded users with API calls
2. **Add More Roles** - Extend for more user types
3. **Add Features** - Profile management, password reset, etc.
4. **Database Integration** - Use Firebase or your backend
5. **JWT Tokens** - Implement proper token-based auth
6. **Social Login** - Add Google, GitHub, etc.

---

**Happy Learning! 🚀**

For questions or improvements, feel free to enhance this authentication system!
