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
    
    // Enhanced payment features
    cardType: string = '';
    isProcessingPayment = false;
    paymentSuccess = false;
    showSecurityBadge = true;
    formErrors: any = {};
    isFormSubmitted = false;

    constructor(
        private cartService: CartService,
        private authService: AuthService,
        private fb: FormBuilder,
        private router: Router
    ) {
        this.checkoutForm = this.fb.group({
            // Customer Info
            fullName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]+$/)]],
            phone: ['', [Validators.required, Validators.pattern(/^(?:(?:\+|00)212|0)[5-7]\d{8}$/)]],
            city: ['', [Validators.required, Validators.minLength(2)]],
            address: ['', [Validators.required, Validators.minLength(10)]],
            email: ['', [Validators.required, Validators.email]],

            // Card Info (only required if online payment is selected)
            cardNumber: ['', []],
            cardName: ['', []],
            expiryDate: ['', []],
            cvv: ['', []],
            saveCard: [false]
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
                        phone: user.phone,
                        email: user.email || ''
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

        // Real-time validation
        this.setupRealTimeValidation();
    }

    // Enhanced card type detection
    detectCardType(cardNumber: string): string {
        const cleaned = cardNumber.replace(/\s/g, '');
        
        if (/^4/.test(cleaned)) return 'visa';
        if (/^5[1-5]/.test(cleaned)) return 'mastercard';
        if (/^3[47]/.test(cleaned)) return 'amex';
        if (/^6(?:011|5)/.test(cleaned)) return 'discover';
        
        return '';
    }

    // Format card number with spaces
    formatCardNumber(event: any) {
        let value = event.target.value.replace(/\s/g, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        event.target.value = formattedValue;
        this.cardType = this.detectCardType(formattedValue);
        this.checkoutForm.get('cardNumber')?.setValue(formattedValue);
    }

    // Format expiry date
    formatExpiryDate(event: any) {
        let value = event.target.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        
        event.target.value = value;
        this.checkoutForm.get('expiryDate')?.setValue(value);
    }

    // CVV helper
    getCvvHelper(): string {
        if (this.cardType === 'amex') return '4 digits on front of card';
        return '3 digits on back of card';
    }

    // Real-time validation setup
    private setupRealTimeValidation() {
        Object.keys(this.checkoutForm.controls).forEach(key => {
            const control = this.checkoutForm.get(key);
            if (control) {
                control.valueChanges.subscribe(() => {
                    this.updateFieldError(key);
                });
            }
        });
    }

    // Update field error messages
    updateFieldError(fieldName: string) {
        const field = this.checkoutForm.get(fieldName);
        if (!field) return;

        if (field.invalid && (field.touched || this.isFormSubmitted)) {
            this.formErrors[fieldName] = this.getErrorMessage(fieldName, field.errors);
        } else {
            this.formErrors[fieldName] = '';
        }
    }

    // Get error messages
    private getErrorMessage(fieldName: string, errors: any): string {
        const errorMessages: any = {
            fullName: {
                required: 'Full name is required',
                minlength: 'Name must be at least 3 characters',
                pattern: 'Name can only contain letters and spaces'
            },
            email: {
                required: 'Email is required',
                email: 'Please enter a valid email address'
            },
            phone: {
                required: 'Phone number is required',
                pattern: 'Please enter a valid Moroccan phone number'
            },
            city: {
                required: 'City is required',
                minlength: 'City name must be at least 2 characters'
            },
            address: {
                required: 'Address is required',
                minlength: 'Address must be at least 10 characters'
            },
            cardNumber: {
                required: 'Card number is required',
                pattern: 'Please enter a valid 16-digit card number'
            },
            cardName: {
                required: 'Cardholder name is required',
                minlength: 'Name must be at least 3 characters'
            },
            expiryDate: {
                required: 'Expiry date is required',
                pattern: 'Please enter a valid expiry date (MM/YY)'
            },
            cvv: {
                required: 'CVV is required',
                pattern: 'Please enter a valid CVV'
            }
        };

        const firstError = Object.keys(errors)[0];
        return errorMessages[fieldName]?.[firstError] || 'This field is invalid';
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
            this.checkoutForm.get('cardNumber')?.setValidators([
                Validators.required, 
                Validators.pattern(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/)
            ]);
            this.checkoutForm.get('cardName')?.setValidators([Validators.required, Validators.minLength(3)]);
            this.checkoutForm.get('expiryDate')?.setValidators([
                Validators.required, 
                Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
            ]);
            
            // Different CVV validation for AMEX
            const cvvPattern = this.cardType === 'amex' ? /^\d{4}$/ : /^\d{3}$/;
            this.checkoutForm.get('cvv')?.setValidators([Validators.required, Validators.pattern(cvvPattern)]);
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

    // Enhanced order placement with better error handling
    async requestPlaceOrder() {
        if (this.isLoading || this.isProcessingPayment) return;

        this.isFormSubmitted = true;
        this.paymentError = null;

        // 1. Auth Check
        if (!this.authService.isAuthenticated()) {
            this.showLoginModal = true;
            return;
        }

        // 2. Method Check
        if (!this.selectedMethod) {
            this.paymentError = 'Please select a payment method to proceed.';
            return;
        }

        // 3. Form Validation
        this.checkoutForm.markAllAsTouched();
        Object.keys(this.checkoutForm.controls).forEach(key => {
            this.updateFieldError(key);
        });

        if (this.checkoutForm.invalid) {
            this.paymentError = 'Please fill in all required fields correctly.';
            return;
        }

        await this.onPlaceOrder();
    }

    async onPlaceOrder() {
        if (!this.selectedMethod) return;

        this.isLoading = true;
        this.isProcessingPayment = true;

        try {
            // Simulate payment processing
            await this.processPayment();
            
            // Success
            this.paymentSuccess = true;
            this.cartService.clearCart();
            
            // Navigate to confirmation after delay
            setTimeout(() => {
                this.router.navigate(['/order-confirmation']);
            }, 2000);
            
        } catch (error) {
            this.paymentError = 'Payment failed. Please try again or contact support.';
        } finally {
            this.isLoading = false;
            this.isProcessingPayment = false;
        }
    }

    // Simulate payment processing
    private processPayment(): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 95% success rate
                if (Math.random() > 0.05) {
                    resolve();
                } else {
                    reject(new Error('Payment failed'));
                }
            }, 3000);
        });
    }

    // Security features
    isSecureConnection(): boolean {
        return location.protocol === 'https:' || location.hostname === 'localhost';
    }

    goToLogin() {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
    }

    closeModal() {
        this.showLoginModal = false;
    }
}
