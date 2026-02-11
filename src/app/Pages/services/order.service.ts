import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from './cart.service';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';

export interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
}

export interface Order {
    id: string; // This will be the database UUID
    displayId: string; // Friendly ID like SD-XXXX
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

    private authService = inject(AuthService);

    constructor(private supabase: SupabaseService) {
        // Load orders from localStorage if needed
        const savedOrders = localStorage.getItem('smartdarna_orders');
        if (savedOrders) {
            try {
                this.orders = JSON.parse(savedOrders);
            } catch (e) {
                this.orders = [];
            }
        }
    }

    async createOrder(
        cartItems: CartItem[],
        customerInfo: CustomerInfo,
        paymentMethod: 'cod' | 'online'
    ): Promise<Order> {
        const displayId = 'SD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
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

        // Get current user for IDs
        const currentUser = this.authService.user.value;
        const userId = currentUser?.id || null;

        // Pick seller_id from the first product (assuming single seller per order for now)
        const sellerId = cartItems.length > 0 ? cartItems[0].product.seller_id : null;

        const dbOrder = {
            customer_id: userId, // Link to profile/customer
            user_id: userId,
            seller_id: sellerId,
            total_amount: total,
            status: 'pending',
            shipping_address: JSON.stringify({
                name: customerInfo.name,
                email: customerInfo.email,
                phone: customerInfo.phone,
                address: customerInfo.address,
                city: customerInfo.city,
                display_id: displayId,
                tracking_number: trackingNumber,
                payment_method: paymentMethod
            })
        };

        let finalOrderId = displayId;

        // Save to Supabase database
        try {
            console.log('📦 OrderService: Saving order to database...', dbOrder);
            const { data: savedOrder, error: orderError } = await this.supabase.createOrder(dbOrder);

            if (orderError) {
                console.error('❌ OrderService: Failed to save main order:', orderError);
            } else if (savedOrder) {
                console.log('✅ OrderService: Main order saved! ID:', savedOrder.id);
                finalOrderId = savedOrder.id;

                // Now save items to order_items table
                const dbItems = cartItems.map(item => ({
                    order_id: savedOrder.id,
                    product_id: item.product.id,
                    quantity: item.quantity,
                    price_per_item: item.product.price
                }));

                console.log('📦 OrderService: Saving order items...', dbItems);
                const { error: itemsError } = await this.supabase.createOrderItems(dbItems);
                if (itemsError) {
                    console.error('❌ OrderService: Failed to save individual items:', itemsError);
                } else {
                    console.log('✅ OrderService: All items saved successfully!');
                }
            }
        } catch (error) {
            console.error('❌ OrderService: Exception in database save:', error);
        }

        const order: Order = {
            id: finalOrderId,
            displayId: displayId,
            orderDate: new Date(),
            estimatedDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            customerInfo: { ...customerInfo },
            items: orderItems,
            subtotal,
            shipping,
            total,
            paymentMethod,
            status: 'confirmed',
            trackingNumber
        };

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
