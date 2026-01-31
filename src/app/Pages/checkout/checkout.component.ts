import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
    cartItems: CartItem[] = [];
    selectedMethod: 'cod' | 'online' | null = null;
    onlineMethod: 'card' | 'paypal' | 'stripe' = 'card';
    checkoutForm: FormGroup;
    isLoading = false;
    paymentError: string | null = null;
    showLoginModal = false;
    isLoggedIn = false;

    constructor(
        private cartService: CartService,
        private authService: AuthService,
        private fb: FormBuilder,
        private router: Router
    ) {
        this.checkoutForm = this.fb.group({
            // Customer Info
            fullName: ['', [Validators.required, Validators.minLength(3)]],
            phone: ['', [Validators.required, Validators.pattern(/^(?:(?:\+|00)212|0)[5-7]\d{8}$/)]], // Basic Morocco phone regex or general
            city: ['', Validators.required],
            address: ['', [Validators.required, Validators.minLength(10)]],

            // Card Info (only required if online payment is selected, removed validators initially)
            cardNumber: [''],
            cardName: [''],
            expiryDate: [''],
            cvv: ['']
        });
    }

    ngOnInit() {
        // Check Auth Status
        this.authService.isLoggedIn$.subscribe(isLoggedIn => {
            this.isLoggedIn = isLoggedIn;
            if (isLoggedIn) {
                const user = this.authService.getCurrentUser();
                if (user) {
                    this.checkoutForm.patchValue({
                        fullName: user.name,
                        phone: user.phone
                    });
                    this.checkoutForm.enable();
                }
            } else {
                this.checkoutForm.disable();
            }
        });

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
        this.updateValidators();
    }

    selectOnlineMethod(method: 'card' | 'paypal' | 'stripe') {
        this.onlineMethod = method;
        this.paymentError = null;
        this.updateValidators();
    }

    private updateValidators() {
        const cardControls = ['cardNumber', 'cardName', 'expiryDate', 'cvv'];

        if (this.selectedMethod === 'online' && this.onlineMethod === 'card') {
            this.checkoutForm.get('cardNumber')?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
            this.checkoutForm.get('cardName')?.setValidators([Validators.required, Validators.minLength(3)]);
            this.checkoutForm.get('expiryDate')?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
            this.checkoutForm.get('cvv')?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
        } else {
            cardControls.forEach(control => {
                this.checkoutForm.get(control)?.clearValidators();
                this.checkoutForm.get(control)?.updateValueAndValidity();
            });
        }
        cardControls.forEach(control => this.checkoutForm.get(control)?.updateValueAndValidity());
    }

    getSubtotal(): number {
        return this.cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    }

    getTotal(): number {
        return this.getSubtotal();
    }

    // New method to handle order placement with auth check
    requestPlaceOrder() {
        if (this.isLoading) return;

        // 1. Auth Check (Priority)
        if (!this.authService.isAuthenticated()) {
            this.showLoginModal = true;
            return;
        }

        // 2. Method Check
        if (!this.selectedMethod) {
            this.paymentError = 'Please select a payment method to proceed.';
            return;
        }

        this.onPlaceOrder();
    }

    onPlaceOrder() {
        if (!this.selectedMethod) return;

        // Touch all fields to show errors
        this.checkoutForm.markAllAsTouched();

        if (this.checkoutForm.invalid) {
            this.paymentError = 'Please fill in all required fields correctly.';
            return;
        }

        this.isLoading = true;
        this.paymentError = null;

        // Simulate API call
        setTimeout(() => {
            // Success
            this.cartService.clearCart();
            this.isLoading = false;
            this.router.navigate(['/order-confirmation']);
        }, 2000);
    }

    // New method to navigate to login
    goToLogin() {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
    }

    // New method to close the login modal
    closeModal() {
        this.showLoginModal = false;
    }
}
