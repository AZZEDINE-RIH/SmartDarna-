# 🔐 Angular Authentication System - Quick Reference

## ⚡ Quick Start (30 seconds)

```bash
npm start
# Go to http://localhost:4200/login
# Use: admin@example.com / password123
# ✅ Redirects to /admin-dashboard
```

## 👤 Test Credentials

| Role   | Email                  | Password    |
|--------|------------------------|-------------|
| User   | user@example.com       | password123 |
| Seller | vendeur@example.com    | password123 |
| Admin  | admin@example.com      | password123 |

## 🔍 How to Use AuthService

### In Components:

```typescript
import { AuthService } from './services/auth.service';

export class MyComponent {
  constructor(private authService: AuthService) {}

  // Check if logged in
  if (this.authService.isLoggedIn()) {
    console.log('User is logged in');
  }

  // Get current user
  const user = this.authService.getUser();
  console.log(user.name, user.role);

  // Check role
  if (this.authService.hasRole('admin')) {
    console.log('User is admin');
  }

  // Multiple roles
  if (this.authService.hasAnyRole(['admin', 'vendeur'])) {
    console.log('User is admin or seller');
  }

  // Logout
  this.authService.logout();
}
```

### In Templates:

```html
@if (authService.isLoggedIn()) {
  <p>Welcome, {{ authService.getUser()?.name }}</p>
}

@if (authService.hasRole('admin')) {
  <button>Admin Panel</button>
}
```

## 🛡️ Protecting Routes

### Basic Auth Protection:

```typescript
{
  path: 'protected',
  component: ProtectedComponent,
  canActivate: [AuthGuard]
}
```

### Role-Based Protection:

```typescript
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['admin'] }
}
```

### Multiple Roles Allowed:

```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['admin', 'vendeur'] }
}
```

## 📂 Project Structure at a Glance

```
✅ Auth/login/                      # Login page
✅ app/services/auth.service.ts    # Core auth logic
✅ app/guards/                      # Auth & Role guards
✅ app/dashboard/                   # Role-based dashboards
✅ app/app.routes.ts               # All routes configured
```

## 🔄 Authentication Flow Diagram

```
User visits /
    ↓
Redirect to /login
    ↓
AuthService checks localStorage
    ├─ If logged in → Redirect to dashboard ✓
    └─ If not → Show login form
    ↓
User enters credentials
    ↓
AuthService.login() validates
    ├─ Invalid → Show error message
    └─ Valid → Save to localStorage
    ↓
Redirect based on role:
    ├─ user → /home
    ├─ vendeur → /vendeur-dashboard
    └─ admin → /admin-dashboard
    ↓
AuthGuard + RoleGuard protect routes
    ├─ Authenticated? ✓ Continue
    ├─ Wrong role? → Redirect to correct dashboard
    └─ Not auth? → Redirect to /login
    ↓
Logout clears localStorage → Back to /login
```

## 🎯 File Locations

| File | Purpose |
|------|---------|
| `src/app/services/auth.service.ts` | Authentication logic |
| `src/app/guards/auth.guard.ts` | Prevent unauthorized access |
| `src/app/guards/role.guard.ts` | Enforce role-based access |
| `src/Auth/login/login.ts` | Login form component |
| `src/app/dashboard/home/` | User dashboard |
| `src/app/dashboard/vendeur-dashboard/` | Seller dashboard |
| `src/app/dashboard/admin-dashboard/` | Admin dashboard |
| `src/app/app.routes.ts` | Route configuration |
| `src/app/app.ts` | Main app component |
| `src/app/app.html` | App template with navbar |

## 💡 Common Tasks

### Add a New User

**Edit**: `src/app/services/auth.service.ts`

```typescript
private users: User[] = [
  // ... existing users
  {
    id: 4,
    email: 'newuser@test.com',
    password: 'password123',
    name: 'New User',
    role: 'user'
  }
];
```

### Create a New Protected Page

1. Create component:
```bash
# In your component file
@Component({
  selector: 'app-mypage',
  template: `<h1>Protected Page</h1>`,
  standalone: true
})
export class MyPageComponent {}
```

2. Add to routes in `src/app/app.routes.ts`:
```typescript
{
  path: 'mypage',
  component: MyPageComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['admin'] }
}
```

3. Access at `http://localhost:4200/mypage` (if authenticated and authorized)

### Check Auth Status in Any Component

```typescript
isLoggedIn = this.authService.isLoggedIn();
currentUser = this.authService.getUser();
userRole = this.authService.getUserRole();
```

### Programmatically Check and Redirect

```typescript
if (!this.authService.isLoggedIn()) {
  this.router.navigate(['/login']);
}

if (!this.authService.hasRole('admin')) {
  this.router.navigate(['/home']);
}
```

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot access protected route" | Check if AuthGuard is applied |
| "Wrong role redirects loop" | Ensure RoleGuard redirect logic is correct |
| "localStorage not persisting" | Check browser storage settings |
| "Can't login with credentials" | Verify email and password match exactly |
| "Navbar not showing" | Check `isLoggedIn()` signal in app.ts |

## 📊 What's Stored

In `localStorage['currentUser']`:
```json
{
  "id": 3,
  "email": "admin@example.com",
  "name": "Admin Smith",
  "role": "admin"
}
```

Cleared on logout! ✓

## 🔧 Key Methods Reference

```typescript
// AuthService methods:
login(email, password)        // Returns LoggedInUser or null
logout()                      // Clears session
isLoggedIn()                  // Returns boolean
getUser()                     // Returns LoggedInUser or null
getUserRole()                 // Returns role string or null
hasRole(role)                 // Returns boolean
hasAnyRole(roles)            // Returns boolean
```

## 🎨 Styling Notes

- Login page: Gradient purple theme
- Navbar: Gradient background with white text
- Dashboards: Light background with cards
- All responsive for mobile

## 📱 Responsive Design

- ✅ Mobile: Single column, adjusted font sizes
- ✅ Tablet: 2 column layouts
- ✅ Desktop: Full featured layout

## 🎓 Learning Resources

This auth system demonstrates:
- Angular Services & DI
- Route Guards (CanActivate)
- Type Safety (TypeScript)
- Signal-based State (Angular 20)
- localStorage API
- Role-Based Access Control
- Reactive Forms

---

**Made for SmartDarna E-commerce Project** 🛍️

Start building! 🚀
