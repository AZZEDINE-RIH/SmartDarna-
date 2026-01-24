import { Routes } from '@angular/router';
import { LoginComponent } from '../Auth/login/login';
import { RegisterComponent } from '../Auth/register/register';
import { HomeComponent } from './dashboard/home/home';
import { VendeurDashboardComponent } from './dashboard/vendeur-dashboard/vendeur-dashboard';
import { AdminDashboardComponent } from './dashboard/admin-dashboard/admin-dashboard';
import { AdminOverviewComponent } from './dashboard/admin-dashboard/pages/overview/overview.component';
import { AdminUsersComponent } from './dashboard/admin-dashboard/pages/users/users.component';
import { AdminSellersComponent } from './dashboard/admin-dashboard/pages/sellers/sellers.component';
import { AdminProductsComponent } from './dashboard/admin-dashboard/pages/products/products.component';
import { AdminOrdersComponent } from './dashboard/admin-dashboard/pages/orders/orders.component';
import { AdminSettingsComponent } from './dashboard/admin-dashboard/pages/settings/settings.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo:'/login',
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
    data: { roles: ['vendeur'] }
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: AdminOverviewComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'sellers', component: AdminSellersComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'settings', component: AdminSettingsComponent }
    ]
  },
  // Temporary route for testing the new dashboard without login/guards
  {
    path: 'new-dashboard',
    component: AdminDashboardComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: AdminOverviewComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'sellers', component: AdminSellersComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'settings', component: AdminSettingsComponent }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
