import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../../shared/product-card/product-card.component';

export interface CartItem {
    product: Product;
    quantity: number;
    selectedColor: string;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItems: CartItem[] = [];
    private cartSubject = new BehaviorSubject<CartItem[]>([]);
    private cartCountSubject = new BehaviorSubject<number>(0);

    constructor() {
        // Load cart from localStorage if needed
        const savedCart = localStorage.getItem('smartdarna_cart');
        if (savedCart) {
            this.cartItems = JSON.parse(savedCart);
            this.updateCart();
        }
    }

    getCartItems(): Observable<CartItem[]> {
        return this.cartSubject.asObservable();
    }

    getCartCount(): Observable<number> {
        return this.cartCountSubject.asObservable();
    }

    addToCart(product: Product, selectedColor: string, quantity: number) {
        const existingItem = this.cartItems.find(
            item => item.product.id === product.id && item.selectedColor === selectedColor
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cartItems.push({ product, selectedColor, quantity });
        }

        this.updateCart();
    }

    updateQuantity(productId: string, color: string, delta: number) {
        const item = this.cartItems.find(i => i.product.id === productId && i.selectedColor === color);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.removeItem(productId, color);
            } else {
                this.updateCart();
            }
        }
    }

    removeItem(productId: string, color: string) {
        this.cartItems = this.cartItems.filter(
            i => !(i.product.id === productId && i.selectedColor === color)
        );
        this.updateCart();
    }

    private updateCart() {
        this.cartSubject.next([...this.cartItems]);
        const count = this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
        this.cartCountSubject.next(count);
        localStorage.setItem('smartdarna_cart', JSON.stringify(this.cartItems));
    }

    clearCart() {
        this.cartItems = [];
        this.updateCart();
    }
}
