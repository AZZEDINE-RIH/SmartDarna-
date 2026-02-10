import { Routes } from '@angular/router';
import { AuthSwapComponent } from './Auth/auth-swap/auth-swap.component';
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
import { Dashboard } from './User/dashboard/dashboard';
import { Declaration } from './User/declaration/declaration';
import { Messages } from './User/messages/messages';
import { Orders } from './User/orders/orders';
import { SettingsComponent } from './User/settings/settings';
import { ProfileComponent } from './User/profile/profile';

import { HomePage } from './Pages/home/home-page/home-page';
import { ContactComponent } from './Pages/contact/contact.component';
import { CollectionComponent } from './Pages/collection/collection.component';
import { ProductDetailsComponent } from './Pages/product-details/product-details.component';
import { CartComponent } from './Pages/cart/cart.component';
import { AboutComponent } from './Pages/about/about.component';
import { ServicesComponent } from './Pages/services-page/services.component';
import { OrderConfirmationComponent } from './Pages/order-confirmation/order-confirmation.component';
import { TeamComponent } from './Pages/team/team.component';
import { CheckoutComponent } from './Pages/checkout-page/checkout.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
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
  // Public Pages
  {
    path: 'team',
    component: TeamComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'collection',
    component: CollectionComponent,
  },
  {
    path: 'services',
    component: ServicesComponent,
  },
  {
    path: 'contact',
    component: ContactComponent,
  },
  {
    path: 'product/:id',
    component: ProductDetailsComponent,
  },
  {
    path: 'cart',
    component: CartComponent,
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
  },
  {
    path: 'order-confirmation',
    component: OrderConfirmationComponent,
  },
  // Protected Routes
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'user',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['seller', 'user'] },
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'declarations', component: Declaration },
      { path: 'messages', component: Messages },
      { path: 'orders', component: Orders },
      { path: 'settings', component: SettingsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
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
    redirectTo: ''
  }
];
