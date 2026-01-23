import { Routes } from '@angular/router';
import { Store } from './Store/store';
import { Cart } from './Cart/cart';
import { Payment} from './Payment/payment';
import { NotFound} from './Not-found/not-found';

export const routes: Routes = [
  { path: '', redirectTo: 'store', pathMatch: 'full' },
  { path: 'store', component: Store },
  { path: 'cart', component: Cart },
  { path: 'payment', component: Payment },
  { path: '**', component: NotFound } 
];
