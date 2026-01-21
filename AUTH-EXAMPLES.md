# 📖 Authentication System - Implementation Examples

## Example 1: Using AuthService in a Component

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService, LoggedInUser } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  template: `
    <div class="profile">
      <h1>{{ user?.name }}</h1>
      <p>Email: {{ user?.email }}</p>
      <p>Role: {{ user?.role | uppercase }}</p>
      
      @if (isAdmin) {
        <button>Admin Controls</button>
      }
      
      <button (click)="logout()">Logout</button>
    </div>
  `,
  standalone: true
})
export class ProfileComponent implements OnInit {
  user: LoggedInUser | null = null;
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Get user data
    this.user = this.authService.getUser();
    
    // Check role
    this.isAdmin = this.authService.hasRole('admin');
    
    // Redirect if not logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
```

## Example 2: Conditional Rendering Based on Role

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar">
      <div class="logo">SmartDarna</div>
      
      <div class="nav-items">
        @if (authService.isLoggedIn()) {
          <!-- Show to all logged-in users -->
          <a href="/home">Home</a>
          
          <!-- Show only to sellers -->
          @if (authService.hasRole('vendeur')) {
            <a href="/vendeur-dashboard">My Store</a>
            <a href="/products">Add Product</a>
          }
          
          <!-- Show only to admins -->
          @if (authService.hasRole('admin')) {
            <a href="/admin-dashboard">Admin Panel</a>
            <a href="/users">Manage Users</a>
          }
          
          <!-- Show to any authenticated user -->
          <span>{{ authService.getUser()?.name }}</span>
          <button (click)="logout()">Logout</button>
        } @else {
          <a href="/login">Login</a>
        }
      </div>
    </nav>
  `,
  imports: [CommonModule],
  standalone: true
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
```

## Example 3: Custom Protected Route with Multiple Roles

```typescript
// In app.routes.ts

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['admin', 'vendeur']  // Both admin and vendeur can access
    }
  },
  {
    path: 'analytics',
    component: AnalyticsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['admin', 'vendeur']  // Sellers can see their stats
    }
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['admin']  // Only admins
    }
  }
];
```

## Example 4: Guard Redirect Logic

```typescript
// When user tries to access admin route without permission
// RoleGuard automatically redirects based on role:

// User (id=1) tries /admin-dashboard
// ↓ Redirects to /home

// Vendeur (id=2) tries /admin-dashboard
// ↓ Redirects to /vendeur-dashboard

// Admin (id=3) tries /admin-dashboard
// ↓ Access granted ✓
```

## Example 5: Creating a Permission Directive

```typescript
import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit {
  @Input() appHasRole: string | string[];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const roles = Array.isArray(this.appHasRole) 
      ? this.appHasRole 
      : [this.appHasRole];

    if (this.authService.hasAnyRole(roles)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

// Usage in template:
/*
<div *appHasRole="'admin'">
  Admin only content
</div>

<div *appHasRole="['admin', 'vendeur']">
  For admin or sellers
</div>
*/
```

## Example 6: Login Form with Error Handling

```typescript
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <form (ngSubmit)="onLogin()">
      <h2>Login</h2>
      
      <input 
        type="email" 
        [(ngModel)]="email"
        name="email"
        placeholder="Email"
        required
      />
      
      <input 
        type="password" 
        [(ngModel)]="password"
        name="password"
        placeholder="Password"
        required
      />
      
      @if (error()) {
        <div class="error">{{ error() }}</div>
      }
      
      <button type="submit" [disabled]="loading()">
        {{ loading() ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  `,
  imports: [FormsModule],
  standalone: true
})
export class LoginExampleComponent {
  email = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    const email = this.email().trim();
    const password = this.password().trim();

    // Validation
    if (!email || !password) {
      this.error.set('Email and password are required');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    // Simulate async validation
    setTimeout(() => {
      const user = this.authService.login(email, password);

      if (user) {
        // Success - navigate to dashboard
        this.router.navigate([this.getDashboardUrl(user.role)]);
      } else {
        // Error
        this.loading.set(false);
        this.error.set('Invalid email or password');
        this.password.set('');
      }
    }, 500);
  }

  private getDashboardUrl(role: string): string {
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'vendeur':
        return '/vendeur-dashboard';
      default:
        return '/home';
    }
  }
}
```

## Example 7: Adding User Status Indicator

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-user-status',
  template: `
    <div class="user-status">
      @if (authService.isLoggedIn(); as isAuth) {
        <span class="status-badge online">🟢 Online</span>
        <span class="user-name">
          {{ authService.getUser()?.name }}
        </span>
        <span class="user-role">
          {{ authService.getUser()?.role | uppercase }}
        </span>
      } @else {
        <span class="status-badge offline">🔴 Offline</span>
      }
    </div>
  `,
  styles: [`
    .user-status {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    
    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
    }
    
    .status-badge.online {
      background: #d4edda;
      color: #155724;
    }
    
    .status-badge.offline {
      background: #f8d7da;
      color: #721c24;
    }
  `],
  imports: [CommonModule],
  standalone: true
})
export class UserStatusComponent {
  constructor(public authService: AuthService) {}
}
```

## Example 8: Session Persistence Test

```typescript
// Test that session persists after page reload

// 1. Login
// authService.login('admin@example.com', 'password123')

// 2. Check localStorage
// localStorage.getItem('currentUser')
// → Should return user object

// 3. Refresh page
// window.location.reload()

// 4. Check status
// authService.isLoggedIn() → true ✓
// authService.getUser() → user object ✓

// 5. Logout
// authService.logout()
// localStorage.getItem('currentUser') → null ✓
```

## Example 9: Role-Based Feature Flags

```typescript
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {
  constructor(private authService: AuthService) {}

  canAddProducts(): boolean {
    return this.authService.hasRole('vendeur') || 
           this.authService.hasRole('admin');
  }

  canManageUsers(): boolean {
    return this.authService.hasRole('admin');
  }

  canViewAnalytics(): boolean {
    return this.authService.hasAnyRole(['admin', 'vendeur']);
  }

  canCheckout(): boolean {
    return this.authService.isLoggedIn();
  }
}

// Usage:
/*
@Component({...})
export class ProductComponent {
  constructor(private features: FeatureFlagService) {}
  
  @if (features.canAddProducts()) {
    <button>Add Product</button>
  }
}
*/
```

## Example 10: Handling Unauthorized Access

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-admin-panel',
  template: `
    @if (hasAccess) {
      <h1>Admin Panel</h1>
      <!-- Admin content -->
    } @else {
      <div class="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <button (click)="goToDashboard()">Go to Dashboard</button>
      </div>
    }
  `,
  standalone: true
})
export class AdminPanelComponent implements OnInit {
  hasAccess = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.authService.hasRole('admin')) {
      this.hasAccess = false;
      // Redirect after 2 seconds
      setTimeout(() => {
        this.goToDashboard();
      }, 2000);
      return;
    }

    this.hasAccess = true;
  }

  goToDashboard() {
    const role = this.authService.getUser()?.role;
    const url = role === 'vendeur' ? '/vendeur-dashboard' : '/home';
    this.router.navigate([url]);
  }
}
```

---

## 🎯 Key Takeaways

- **Always check authentication** before accessing user data
- **Use guards** to protect sensitive routes
- **Check roles** before showing role-specific features
- **Handle errors gracefully** (show messages, redirect appropriately)
- **Persist sessions** using localStorage
- **Clear data on logout** for security

---

**These examples cover most common authentication scenarios!** 🚀
