import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
    cartItems: CartItem[] = [];
    selectedMethod: 'cod' | 'online' | null = null;
    onlineMethod: 'card' | 'paypal' | 'stripe' = 'card';
    paymentForm: FormGroup;
    isLoading = false;
    paymentError: string | null = null;

    constructor(
        private cartService: CartService,
        private fb: FormBuilder,
        private router: Router
    ) {
        this.paymentForm = this.fb.group({
            cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
            cardName: ['', [Validators.required, Validators.minLength(3)]],
            expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
            cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
        });
    }

    ngOnInit() {
        this.cartService.getCartItems().subscribe(items => {
            this.cartItems = items;
            if (items.length === 0) {
                this.router.navigate(['/cart']);
            }
        });
    }

    selectMethod(method: 'cod' | 'online') {
        this.selectedMethod = method;
        this.paymentError = null;
    }

    selectOnlineMethod(method: 'card' | 'paypal' | 'stripe') {
        this.onlineMethod = method;
        this.paymentError = null;
    }

    getSubtotal(): number {
        return this.cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    }

    getTotal(): number {
        return this.getSubtotal();
    }

    onPlaceOrder() {
        if (!this.selectedMethod) return;

        this.isLoading = true;
        this.paymentError = null;

        // Simulate API call
        setTimeout(() => {
            if (this.selectedMethod === 'online' && this.onlineMethod === 'card' && this.paymentForm.invalid) {
                this.paymentError = 'Please check your payment details and try again.';
                this.isLoading = false;
                return;
            }

            // Success simulation
            this.isLoading = false;
            this.router.navigate(['/order-confirmation']);
        }, 2000);
    }
}
