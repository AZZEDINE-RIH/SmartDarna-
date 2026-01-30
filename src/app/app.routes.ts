import { Routes } from '@angular/router';
import { LoginComponent } from './Auth/login/login.component';
import { RegisterComponent } from './Auth/register/register.component';
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
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo:'/dashboard/overview',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
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
        path: 'products',
        component: ProductsPageComponent
      },
      {
        path: 'users',
        component: UsersPageComponent
      },
      {
        path: 'sellers',
        component: SellersPageComponent
      },
      {
        path: 'orders',
        component: OrdersPageComponent
      },
      {
        path: 'analytics',
        component: AnalyticsPageComponent
      },
      {
        path: 'settings',
        component: SettingsPageComponent
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
