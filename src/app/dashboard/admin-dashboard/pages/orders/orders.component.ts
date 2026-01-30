import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="page-container"><h1>Orders Management</h1><p>Manage customer orders and fulfillment</p></div>`,
  styles: [`.page-container{padding:2rem;}`]
})
export class OrdersPageComponent { constructor() {} }
