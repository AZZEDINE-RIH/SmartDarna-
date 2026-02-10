import { Injectable } from '@angular/core';
import { Order } from './order.service';

@Injectable({
    providedIn: 'root'
})
export class EmailService {
    constructor() {}

    sendOrderConfirmation(order: Order): Promise<void> {
        // In a real application, this would make an HTTP call to your backend
        // which would then send an email using a service like SendGrid, AWS SES, etc.
        
        return new Promise((resolve, reject) => {
            // Simulate email sending delay
            setTimeout(() => {
                try {
                    // Log the email content for demonstration
                    console.log('📧 Order Confirmation Email Sent:');
                    console.log('To:', order.customerInfo.email);
                    console.log('Subject: `Order Confirmation - SmartDarna`');
                    console.log('Body:', this.generateEmailBody(order));
                    
                    // Store email in localStorage for demo purposes
                    this.storeEmailConfirmation(order);
                    
                    resolve();
                } catch (error) {
                    console.error('Failed to send confirmation email:', error);
                    reject(error);
                }
            }, 2000);
        });
    }

    private generateEmailBody(order: Order): string {
        const itemsList = order.items.map(item => 
            `${item.name} (x${item.quantity}, ${item.selectedColor}) - ${item.price * item.quantity} MAD`
        ).join('\n');

        return `
Dear ${order.customerInfo.name},

Thank you for your order from SmartDarna! We're excited to serve you.

ORDER CONFIRMATION
==================
Order ID: ${order.id}
Order Date: ${order.orderDate.toLocaleDateString()}
Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}

CUSTOMER INFORMATION
====================
Name: ${order.customerInfo.name}
Email: ${order.customerInfo.email}
Phone: ${order.customerInfo.phone}
Address: ${order.customerInfo.address}, ${order.customerInfo.city}

ORDER ITEMS
===========
${itemsList}

ORDER SUMMARY
==============
Subtotal: ${order.subtotal} MAD
Shipping: FREE
Total: ${order.total} MAD

DELIVERY INFORMATION
====================
Estimated Delivery: ${order.estimatedDelivery.toLocaleDateString()}
Delivery Time: Within 15 days
Shipping: Free
Tracking Number: ${order.trackingNumber}

IMPORTANT NOTES
===============
- Your order has been successfully confirmed and is being processed.
- Delivery will arrive within 15 days.
- Shipping is completely free.
- You can track your order using the tracking number above.

If you have any questions about your order, please don't hesitate to contact us:
- Email: support@smartdarna.ma
- Phone: +212 600 000 000

Thank you for choosing SmartDarna!

Best regards,
The SmartDarna Team
        `.trim();
    }

    private storeEmailConfirmation(order: Order): void {
        const emailData = {
            to: order.customerInfo.email,
            subject: `Order Confirmation - SmartDarna Order #${order.id}`,
            body: this.generateEmailBody(order),
            sentAt: new Date().toISOString(),
            orderId: order.id
        };

        // Store in localStorage for demo purposes
        const existingEmails = JSON.parse(localStorage.getItem('smartdarna_emails') || '[]');
        existingEmails.push(emailData);
        localStorage.setItem('smartdarna_emails', JSON.stringify(existingEmails));
    }

    getEmailHistory(): any[] {
        return JSON.parse(localStorage.getItem('smartdarna_emails') || '[]');
    }
}
