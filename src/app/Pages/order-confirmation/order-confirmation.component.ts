import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';

@Component({
    selector: 'app-order-confirmation',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './order-confirmation.component.html',
    styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
    orderId: string = '';
    orderDate: Date = new Date();
    estimatedDelivery: Date = new Date();
    customerInfo: any = {};
    orderItems: any[] = [];
    orderTotal: number = 0;
    paymentMethod: string = '';
    trackingNumber: string = '';

    constructor(private cartService: CartService) { }

    ngOnInit() {
        // Generate a random order ID for visual effect
        this.orderId = 'SD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        this.trackingNumber = 'TRK-' + Math.random().toString(36).substr(2, 12).toUpperCase();
        
        // Set estimated delivery (5-7 business days)
        this.estimatedDelivery = new Date();
        this.estimatedDelivery.setDate(this.estimatedDelivery.getDate() + 7);

        // Simulate order data (in real app, this would come from the order service)
        this.simulateOrderData();

        // Clear the cart upon successful order
        this.cartService.clearCart();
    }

    private simulateOrderData() {
        // Simulate customer info
        this.customerInfo = {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+212 600 000 000',
            address: 'Appt 4, Building 12, Main St, Casablanca'
        };

        // Simulate order items
        this.orderItems = [
            {
                name: 'Smart Home Starter Kit',
                quantity: 2,
                price: 2499,
                color: 'White'
            },
            {
                name: 'Smart Lighting System',
                quantity: 1,
                price: 899,
                color: 'Black'
            }
        ];

        this.orderTotal = this.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        this.paymentMethod = 'Credit Card';
    }

    downloadInvoice() {
        // Simulate invoice download
        const invoiceData = {
            orderId: this.orderId,
            date: this.orderDate,
            customer: this.customerInfo,
            items: this.orderItems,
            total: this.orderTotal
        };

        // Create a simple text invoice
        const invoiceText = `
ORDER INVOICE
===============
Order ID: ${this.orderId}
Date: ${this.orderDate.toLocaleDateString()}
Customer: ${this.customerInfo.name}
Email: ${this.customerInfo.email}
Phone: ${this.customerInfo.phone}
Address: ${this.customerInfo.address}

Items:
${this.orderItems.map(item => `${item.name} x${item.quantity} - ${item.price * item.quantity} MAD`).join('\n')}

Total: ${this.orderTotal} MAD
Payment Method: ${this.paymentMethod}
        `;

        // Download as text file
        const blob = new Blob([invoiceText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${this.orderId}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    trackOrder() {
        // Simulate tracking URL
        window.open(`https://smartdarna.com/tracking/${this.trackingNumber}`, '_blank');
    }

    printOrder() {
        window.print();
    }
}
