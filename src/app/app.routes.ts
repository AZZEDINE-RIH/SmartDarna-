import { Routes } from '@angular/router';
import { Dashboard } from './User/dashboard/dashboard';
import { Declaration } from './User/declaration/declaration';
import { Messages } from './User/messages/messages';
import { Orders } from './User/orders/orders';
import { SettingsComponent } from './User/settings/settings';
import { ProfileComponent } from './User/profile/profile';

export const routes: Routes = [
  {
    path: 'user',
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'declarations', component: Declaration },
      { path: 'messages', component: Messages },
      { path: 'orders', component: Orders},
      { path: 'settings', component: SettingsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/user/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/user/dashboard' }
];
