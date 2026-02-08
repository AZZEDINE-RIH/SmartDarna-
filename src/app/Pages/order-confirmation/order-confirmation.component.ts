import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { OrderService, Order } from '../services/order.service';
import { EmailService } from '../services/email.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private emailService = inject(EmailService);
  private router = inject(Router);

  emailSent = signal(false);
  emailError = signal(false);

  orderData = computed(() => {
    const order = this.orderService.getCurrentOrder();
    if (!order) {
      return {
        orderId: '',
        emailSent: this.emailSent(),
        customer: { name: '', email: '', phone: '', address: '' },
        items: [] as { name: string; quantity: number; price: number }[],
        summary: { subtotal: 0, total: 0 },
        delivery: { trackingNumber: '', expectedDelivery: '', paymentMethod: '' }
      };
    }
    return {
      orderId: order.id,
      emailSent: this.emailSent(),
      customer: {
        name: order.customerInfo.name,
        email: order.customerInfo.email,
        phone: order.customerInfo.phone,
        address: `${order.customerInfo.address}, ${order.customerInfo.city}`
      },
      items: order.items.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price * i.quantity
      })),
      summary: {
        subtotal: order.subtotal,
        total: order.total
      },
      delivery: {
        trackingNumber: order.trackingNumber,
        expectedDelivery: new Date(order.estimatedDelivery).toLocaleDateString(),
        paymentMethod: order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'
      }
    };
  });

  ngOnInit() {
    const order = this.orderService.getCurrentOrder();
    if (!order) {
      this.router.navigate(['/']);
      return;
    }
    this.sendConfirmationEmail(order);
  }

  async sendConfirmationEmail(order: Order) {
    try {
      await this.emailService.sendOrderConfirmation(order);
      this.emailSent.set(true);
    } catch {
      this.emailError.set(true);
    }
  }

  continueShopping() {
    this.router.navigate(['/collection']);
  }

  trackOrder() {
    const order = this.orderService.getCurrentOrder();
    if (order) {
      window.open(`https://smartdarna.com/tracking/${order.trackingNumber}`, '_blank');
    }
  }
}
