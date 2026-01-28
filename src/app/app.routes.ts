import { Routes } from '@angular/router';
import { Dashboard } from './User/dashboard/dashboard';
import { Declaration } from './User/declaration/declaration';
import { Messages } from './User/messages/messages';

export const routes: Routes = [
  {
    path: 'user',
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'declarations', component: Declaration },
      { path: 'messages', component: Messages },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/user/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/user/dashboard' }
];
