import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../../shared/product-card/product-card.component';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private cartCountSubject = new BehaviorSubject<number>(0);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('smartdarna_cart');
      if (saved) {
        try {
          this.cartItems = JSON.parse(saved);
          this.updateCart();
        } catch {
          this.cartItems = [];
        }
      }
    }
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  getCartCount(): Observable<number> {
    return this.cartCountSubject.asObservable();
  }

  addToCart(product: Product, selectedColor: string, quantity: number) {
    const existing = this.cartItems.find(
      i => i.product.id === product.id && i.selectedColor === selectedColor
    );
    if (existing) existing.quantity += quantity;
    else this.cartItems.push({ product, selectedColor, quantity });
    this.updateCart();
  }

  updateQuantity(productId: string, color: string, delta: number) {
    const item = this.cartItems.find(i => i.product.id === productId && i.selectedColor === color);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) this.removeItem(productId, color);
    else this.updateCart();
  }

  removeItem(productId: string, color: string) {
    this.cartItems = this.cartItems.filter(
      i => !(i.product.id === productId && i.selectedColor === color)
    );
    this.updateCart();
  }

  clearCart() {
    this.cartItems = [];
    this.updateCart();
  }

  private updateCart() {
    this.cartSubject.next([...this.cartItems]);
    this.cartCountSubject.next(this.cartItems.reduce((a, i) => a + i.quantity, 0));
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('smartdarna_cart', JSON.stringify(this.cartItems));
    }
  }
}
