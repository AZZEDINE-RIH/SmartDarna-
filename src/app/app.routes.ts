import { Routes } from '@angular/router';
import { Dashboard } from './User/dashboard/dashboard';
import { Declaration } from './User/declaration/declaration';
import { Messages } from './User/messages/messages';
import { Orders } from './User/orders/orders';
import { Settings } from './User/settings/settings';

export const routes: Routes = [
  {
    path: 'user',
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'declarations', component: Declaration },
      { path: 'messages', component: Messages },
      { path: 'orders', component: Orders},
      { path: 'settings', component: Settings },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/user/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/user/dashboard' }
];
