import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Declaration } from '../User/declaration/declaration';
import { Dashboard } from './dashboard/dashboard';

const routes: Routes = [
    { path: '', component: Dashboard },
    { path: 'declaration', component: Declaration },
    { path: '**', redirectTo: '' } // 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
