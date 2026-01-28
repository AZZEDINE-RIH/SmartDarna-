import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
    selector: 'app-order-confirmation',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './order-confirmation.component.html',
    styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
    orderId: string = '';

    constructor(private cartService: CartService) { }

    ngOnInit() {
        // Generate a random order ID for visual effect
        this.orderId = 'SD-' + Math.random().toString(36).substr(2, 9).toUpperCase();

        // Clear the cart upon successful order
        this.cartService.clearCart();
    }
}
