import { Routes } from '@angular/router';
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
  },
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
  {
    path: '**',
    redirectTo: '',
  },
];
