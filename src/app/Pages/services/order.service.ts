import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from './cart.service';
import { SupabaseService } from '../../services/supabase.service';

export interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
}

export interface Order {
    id: string;
    orderDate: Date;
    estimatedDelivery: Date;
    customerInfo: CustomerInfo;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    total: number;
    paymentMethod: 'cod' | 'online';
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
    trackingNumber: string;
}

export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    selectedColor: string;
    image: string;
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private orders: Order[] = [];
    private currentOrderSubject = new BehaviorSubject<Order | null>(null);
    public currentOrder$ = this.currentOrderSubject.asObservable();

    constructor(private supabase: SupabaseService) {
        // Load orders from localStorage if needed
        const savedOrders = localStorage.getItem('smartdarna_orders');
        if (savedOrders) {
            this.orders = JSON.parse(savedOrders);
        }
    }

    async createOrder(
        cartItems: CartItem[],
        customerInfo: CustomerInfo,
        paymentMethod: 'cod' | 'online'
    ): Promise<Order> {
        const orderId = 'SD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const trackingNumber = 'TRK-' + Math.random().toString(36).substr(2, 12).toUpperCase();

        const orderItems: OrderItem[] = cartItems.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            selectedColor: item.selectedColor,
            image: item.product.images[0]
        }));

        const subtotal = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = 0; // Free shipping
        const total = subtotal + shipping;

        const order: Order = {
            id: orderId,
            orderDate: new Date(),
            estimatedDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            customerInfo: {
                name: customerInfo.name,
                email: customerInfo.email,
                phone: customerInfo.phone,
                address: customerInfo.address,
                city: customerInfo.city
            },
            items: orderItems,
            subtotal,
            shipping,
            total,
            paymentMethod,
            status: 'confirmed',
            trackingNumber
        };

        // Save to Supabase database
        try {
            // Store all order details in shipping_address as JSON since other columns don't exist
            const orderDetails = {
                customer: {
                    name: customerInfo.name,
                    email: customerInfo.email,
                    phone: customerInfo.phone,
                    address: customerInfo.address,
                    city: customerInfo.city
                },
                items: orderItems,
                payment_method: paymentMethod,
                tracking_number: trackingNumber
            };

            const dbOrder = {
                // Match actual database schema from screenshot:
                // id, customer_id, total_amount, status, shipping_address, created_at, updated_at, user_id, seller_id
                customer_id: null, // Guest checkout
                total_amount: total,
                status: 'pending',
                shipping_address: JSON.stringify(orderDetails),
                user_id: null, // Guest checkout
                seller_id: null // No seller association
            };

            console.log('📦 OrderService: Saving order to database...', dbOrder);
            const { data, error } = await this.supabase.createOrder(dbOrder);

            if (error) {
                console.error('❌ OrderService: Failed to save order to database:', error);
                // Continue with localStorage as fallback
            } else {
                console.log('✅ OrderService: Order saved to database successfully:', data);
            }
        } catch (error) {
            console.error('❌ OrderService: Exception saving order:', error);
            // Continue with localStorage as fallback
        }

        // Also save to localStorage as backup
        this.orders.push(order);
        this.saveOrders();
        this.currentOrderSubject.next(order);

        return order;
    }

    getCurrentOrder(): Order | null {
        return this.currentOrderSubject.value;
    }

    getOrders(): Order[] {
        return [...this.orders];
    }

    getOrderById(id: string): Order | undefined {
        return this.orders.find(order => order.id === id);
    }

    updateOrderStatus(orderId: string, status: Order['status']): void {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            this.saveOrders();
            if (this.currentOrderSubject.value?.id === orderId) {
                this.currentOrderSubject.next(order);
            }
        }
    }

    private saveOrders(): void {
        localStorage.setItem('smartdarna_orders', JSON.stringify(this.orders));
    }

    clearCurrentOrder(): void {
        this.currentOrderSubject.next(null);
    }
}
