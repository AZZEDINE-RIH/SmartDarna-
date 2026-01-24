import { Routes } from '@angular/router';
import { LoginComponent } from '../Auth/login/login';
import { RegisterComponent } from '../Auth/register/register';
import { HomeComponent } from './dashboard/home/home';
import { VendeurDashboardComponent } from './dashboard/vendeur-dashboard/vendeur-dashboard';
import { AdminDashboardComponent } from './dashboard/admin-dashboard/admin-dashboard';
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
    data: { roles: ['admin'] }
  },
  // Temporary route for testing the new dashboard without login/guards
  {
    path: 'new-dashboard',
    component: AdminDashboardComponent
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
