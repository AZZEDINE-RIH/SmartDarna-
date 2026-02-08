import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from './cart.service';
import { Product } from '../../shared/product-card/product-card.component';

@Injectable({
    providedIn: 'root'
})
export class CheckoutFlowService {
    constructor(
        private cartService: CartService,
        private router: Router
    ) {}

    async buyNow(product: Product, selectedColor: string = product.colors[0] || 'Default', quantity: number = 1): Promise<void> {
        try {
            // Add product to cart
            this.cartService.addToCart(product, selectedColor, quantity);
            
            // Navigate to checkout
            await this.router.navigate(['/checkout']);
        } catch (error) {
            console.error('Error in buy now flow:', error);
            // Optionally show error message to user
        }
    }

    async startCheckout(product?: Product): Promise<void> {
        if (product) {
            // If a product is provided, add it to cart first
            await this.buyNow(product);
        } else {
            // If no product, just navigate to checkout
            await this.router.navigate(['/checkout']);
        }
    }
}
