import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService, CartItem } from '../services/cart.service';
import { OrderService } from '../services/order.service';

type PaymentType = 'credit_card' | 'paypal' | 'cod';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  cartItems = signal<CartItem[]>([]);
  subtotal = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  );
  shipping = computed(() => 0);
  total = computed(() => this.subtotal() + this.shipping());

  checkoutForm!: FormGroup;

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(items => this.cartItems.set(items));

    this.checkoutForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]{8,}$/)]],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: [''],
      postalCode: ['', Validators.required],
      country: ['Morocco', Validators.required],
      paymentMethod: ['credit_card' as PaymentType, Validators.required],
      cardNumber: [''],
      cardExpiry: [''],
      cardCvv: [''],
      cardholderName: ['']
    });

    this.checkoutForm.get('paymentMethod')?.valueChanges.subscribe((method: PaymentType) => {
      const cardNumber = this.checkoutForm.get('cardNumber');
      const cardExpiry = this.checkoutForm.get('cardExpiry');
      const cardCvv = this.checkoutForm.get('cardCvv');
      const cardholderName = this.checkoutForm.get('cardholderName');
      if (method === 'credit_card') {
        cardNumber?.setValidators([Validators.required]);
        cardExpiry?.setValidators([Validators.required]);
        cardCvv?.setValidators([Validators.required]);
        cardholderName?.setValidators([Validators.required]);
      } else {
        cardNumber?.clearValidators();
        cardExpiry?.clearValidators();
        cardCvv?.clearValidators();
        cardholderName?.clearValidators();
      }
      cardNumber?.updateValueAndValidity();
      cardExpiry?.updateValueAndValidity();
      cardCvv?.updateValueAndValidity();
      cardholderName?.updateValueAndValidity();
    });
  }

  placeOrder(): void {
    if (this.cartItems().length === 0) return;
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const v = this.checkoutForm.value;
    const paymentMethod: 'cod' | 'online' =
      (v.paymentMethod as PaymentType) === 'cod' ? 'cod' : 'online';

    const customerInfo = {
      name: v.fullName,
      email: v.email,
      phone: v.phone,
      address: [v.addressLine1, v.addressLine2].filter(Boolean).join(', '),
      city: [v.city, v.state, v.postalCode, v.country].filter(Boolean).join(', ')
    };

    this.orderService.createOrder(this.cartItems(), customerInfo, paymentMethod);
    this.cartService.clearCart();
    this.router.navigate(['/order-confirmation']);
  }

  hasError(controlName: string, errorType: string): boolean {
    const c = this.checkoutForm.get(controlName);
    return !!(c && c.touched && c.hasError(errorType));
  }
}
