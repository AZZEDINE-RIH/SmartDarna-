import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../core/services/cart.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
    cartItems: CartItem[] = [];

    constructor(
        private cartService: CartService,
        private router: Router
    ) { }

    ngOnInit() {
        this.cartService.getCartItems().subscribe(items => {
            this.cartItems = items;
        });
    }

    updateQuantity(item: CartItem, delta: number) {
        this.cartService.updateQuantity(item.product.id, item.selectedColor, delta);
    }

    removeItem(item: CartItem) {
        this.cartService.removeItem(item.product.id, item.selectedColor);
    }

    getSubtotal(): number {
        return this.cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    }

    getTotal(): number {
        return this.getSubtotal();
    }

    onCheckout() {
        this.router.navigate(['/checkout']);
    }
}
