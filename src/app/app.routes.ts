import { Routes } from '@angular/router';
import { AuthSwapComponent } from './Auth/auth-swap/auth-swap.component';
import { HomeComponent } from './dashboard/home/home';
import { VendeurDashboardComponent } from './dashboard/vendeur-dashboard/vendeur-dashboard';
import { AdminDashboardComponent } from './dashboard/admin-dashboard/admin-dashboard.component';
import { AdminOverviewComponent } from './dashboard/admin-dashboard/pages/overview/overview.component';
import { ProductsPageComponent } from './dashboard/admin-dashboard/pages/products/products.component';
import { UsersPageComponent } from './dashboard/admin-dashboard/pages/users/users.component';
import { SellersPageComponent } from './dashboard/admin-dashboard/pages/sellers/sellers.component';
import { OrdersPageComponent } from './dashboard/admin-dashboard/pages/orders/orders.component';
import { AnalyticsPageComponent } from './dashboard/admin-dashboard/pages/analytics/analytics.component';
import { SettingsPageComponent } from './dashboard/admin-dashboard/pages/settings/settings.component';
import { ProfilePageComponent } from './dashboard/admin-dashboard/pages/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { PermissionGuard } from './guards/permission.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo:'/dashboard/overview',
    pathMatch: 'full'
  },
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    redirectTo: 'auth/register',
    pathMatch: 'full'
  },
  {
    path: 'auth/:mode',
    component: AuthSwapComponent
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
    data: { roles: ['seller'] }
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    component: AdminDashboardComponent,
    children: [
      {
        path: 'overview',
        component: AdminOverviewComponent
      },
      {
        path: 'profile',
        component: ProfilePageComponent
      },
      {
        path: 'products',
        component: ProductsPageComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['manage_products'] }
      },
      {
        path: 'users',
        component: UsersPageComponent,
        canActivate: [PermissionGuard],
        data: { superAdminOnly: true }
      },
      {
        path: 'sellers',
        component: SellersPageComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['manage_sellers'] }
      },
      {
        path: 'orders',
        component: OrdersPageComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['manage_orders'] }
      },
      {
        path: 'analytics',
        component: AnalyticsPageComponent,
        canActivate: [PermissionGuard],
        data: { permissions: ['view_analytics'] }
      },
      {
        path: 'settings',
        component: SettingsPageComponent,
        canActivate: [PermissionGuard],
        data: {}
      },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard/overview'
  }
];
