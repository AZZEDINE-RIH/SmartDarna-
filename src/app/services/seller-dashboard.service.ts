import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs';

export interface SellerStats {
    totalSales: number;
    activeOrders: number;
    avgOrderValue: number;
    returnRate: number;
    totalSalesChange: number;
    activeOrdersChange: number;
    avgOrderValueChange: number;
    returnRateChange: number;
}

export interface RevenueData {
    labels: string[];
    data: number[];
}

export interface TopProduct {
    id: string;
    name: string;
    image: string;
    price: number;
    sales: number;
    revenue: number;
    inStock: boolean;
    mark: string;
}

export interface RecentOrder {
    id: string;
    orderId: string;
    customerName: string;
    date: string;
    amount: number;
    status: string;
    productName: string;
}

@Injectable({
    providedIn: 'root'
})
export class SellerDashboardService {

    constructor(private supabase: SupabaseService) { }

    /* ===================== STATS ===================== */

    getSellerStats(sellerId: string): Observable<SellerStats> {
        return from(this.calculateSellerStats(sellerId)).pipe(
            catchError(err => {
                console.error('Seller stats error:', err);
                return of({
                    totalSales: 0,
                    activeOrders: 0,
                    avgOrderValue: 0,
                    returnRate: 0,
                    totalSalesChange: 0,
                    activeOrdersChange: 0,
                    avgOrderValueChange: 0,
                    returnRateChange: 0
                });
            })
        );
    }

    private async calculateSellerStats(sellerId: string): Promise<SellerStats> {
        const client = this.supabase.getClient();

        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

        const { data, error } = await client
            .from('order_items')
            .select(`
        quantity,
        price_per_item,
        products!inner(seller_id),
        orders!inner(id, status, created_at, total_amount)
      `)
            .eq('products.seller_id', sellerId);

        if (error) {
            console.error('❌ SellerDashboardService: Error fetching order items:', error);
            throw error;
        }

        const items = data || [];
        console.log(`📦 SellerDashboardService: Found ${items.length} order items for seller ${sellerId}`);

        /* completed orders (unique) */
        const completedOrders = new Map<string, any>();

        items.forEach((i: any) => {
            // Handle Supabase response structure (array vs object)
            const order = Array.isArray(i.orders) ? i.orders[0] : i.orders;

            if (order && order.status === 'completed') {
                completedOrders.set(order.id, order);
            }
        });

        const totalSales = Array.from(completedOrders.values())
            .reduce((sum, o) => sum + (o.total_amount || 0), 0);

        const activeOrders = completedOrders.size;
        const avgOrderValue = activeOrders ? totalSales / activeOrders : 0;

        const cancelled = new Set(
            items.filter((i: any) => {
                const order = Array.isArray(i.orders) ? i.orders[0] : i.orders;
                return order && order.status === 'cancelled';
            }).map((i: any) => {
                const order = Array.isArray(i.orders) ? i.orders[0] : i.orders;
                return order.id;
            })
        );

        const allOrders = new Set(items.map((i: any) => {
            const order = Array.isArray(i.orders) ? i.orders[0] : i.orders;
            return order?.id;
        }).filter(id => id)); // Filter out undefined

        const returnRate = allOrders.size
            ? (cancelled.size / allOrders.size) * 100
            : 0;

        const currentMonthSales = Array.from(completedOrders.values())
            .filter(o => o.created_at >= currentMonthStart)
            .reduce((s, o) => s + (o.total_amount || 0), 0);

        const lastMonthOrders = new Map<string, any>();
        items.forEach((i: any) => {
            const order = Array.isArray(i.orders) ? i.orders[0] : i.orders;
            if (
                order &&
                order.status === 'completed' &&
                order.created_at >= lastMonthStart &&
                order.created_at <= lastMonthEnd
            ) {
                lastMonthOrders.set(order.id, order);
            }
        });

        const lastMonthSales = Array.from(lastMonthOrders.values())
            .reduce((s, o) => s + (o.total_amount || 0), 0);

        const totalSalesChange = lastMonthSales
            ? ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100
            : 0;

        const result = {
            totalSales,
            activeOrders,
            avgOrderValue,
            returnRate,
            totalSalesChange: Number(totalSalesChange.toFixed(1)),
            activeOrdersChange: 0,
            avgOrderValueChange: 0,
            returnRateChange: 0
        };

        console.log('📊 SellerDashboardService: Calculated stats:', result);
        return result;
    }

    /* ===================== MONTHLY REVENUE ===================== */

    getMonthlyRevenue(sellerId: string): Observable<RevenueData> {
        return from(this.fetchMonthlyRevenue(sellerId)).pipe(
            catchError(err => {
                console.error('Revenue error:', err);
                return of({ labels: [], data: [] });
            })
        );
    }

    private async fetchMonthlyRevenue(sellerId: string): Promise<RevenueData> {
        const client = this.supabase.getClient();
        const year = new Date().getFullYear();

        const { data, error } = await client
            .from('order_items')
            .select(`
        products!inner(seller_id),
        orders!inner(id, created_at, status, total_amount)
      `)
            .eq('products.seller_id', sellerId)
            .eq('orders.status', 'completed')
            .gte('orders.created_at', `${year}-01-01`);

        if (error) throw error;

        const revenue = new Array(12).fill(0);
        const usedOrders = new Set<string>();
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        data?.forEach((i: any) => {
            const order = Array.isArray(i.orders) ? i.orders[0] : i.orders;

            if (order && !usedOrders.has(order.id)) {
                usedOrders.add(order.id);
                revenue[new Date(order.created_at).getMonth()] += order.total_amount || 0;
            }
        });

        return { labels, data: revenue };
    }

    /* ===================== TOP PRODUCTS ===================== */

    getTopProducts(sellerId: string): Observable<TopProduct[]> {
        return from(this.fetchTopProducts(sellerId)).pipe(
            catchError(err => {
                console.error('Top products error:', err);
                return of([]);
            })
        );
    }

    private async fetchTopProducts(sellerId: string): Promise<TopProduct[]> {
        const client = this.supabase.getClient();

        const { data: products } = await client
            .from('products')
            .select('id, name, price, stock, images')
            .eq('seller_id', sellerId);

        if (!products?.length) return [];

        const { data: sales } = await client
            .from('order_items')
            .select('product_id, quantity, price_per_item')
            .in('product_id', products.map(p => p.id));

        const map = new Map<string, { sales: number; revenue: number }>();

        sales?.forEach(s => {
            const stat = map.get(s.product_id) || { sales: 0, revenue: 0 };
            stat.sales += s.quantity;
            stat.revenue += s.quantity * s.price_per_item;
            map.set(s.product_id, stat);
        });

        return products
            .map(p => {
                const stat = map.get(p.id) || { sales: 0, revenue: 0 };

                // Parse images
                let image = 'assets/placeholder.png';
                if (p.images) {
                    let imagesArr: any = p.images;
                    if (typeof p.images === 'string') {
                        try {
                            // Try parsing if it's a JSON string
                            const parsed = JSON.parse(p.images);
                            if (Array.isArray(parsed)) imagesArr = parsed;
                            else imagesArr = [p.images];
                        } catch {
                            imagesArr = [p.images];
                        }
                    }
                    if (Array.isArray(imagesArr) && imagesArr.length > 0) {
                        image = imagesArr[0];
                    }
                }

                return {
                    id: p.id,
                    name: p.name,
                    image: image,
                    price: p.price,
                    sales: stat.sales,
                    revenue: stat.revenue,
                    inStock: p.stock > 0,
                    mark: stat.revenue > 1000 ? 'Top Seller' : '—'
                };
            })
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 3);
    }

    /* ===================== RECENT ORDERS ===================== */

    getRecentOrders(sellerId: string): Observable<RecentOrder[]> {
        return from(this.fetchRecentOrders(sellerId)).pipe(
            catchError(err => {
                console.error('Recent orders error:', err);
                return of([]);
            })
        );
    }

    private async fetchRecentOrders(sellerId: string): Promise<RecentOrder[]> {
        const client = this.supabase.getClient();

        // 1. Get seller's product IDs first (Proven to work)
        const { data: products } = await client
            .from('products')
            .select('id, name')
            .eq('seller_id', sellerId);

        if (!products?.length) return [];

        const productIds = products.map(p => p.id);
        const productMap = new Map(products.map(p => [p.id, p]));

        // 2. Fetch recent order items for these products
        const { data, error } = await client
            .from('order_items')
            .select(`
                quantity,
                price_per_item,
                product_id,
                orders!inner(
                    id,
                    created_at,
                    status,
                    customer:profiles!customer_id(name, email)
                )
            `)
            .in('product_id', productIds)
            .order('created_at', { foreignTable: 'orders', ascending: false })
            .limit(10);

        if (error) throw error;

        const map = new Map<string, RecentOrder>();

        data?.forEach((i: any) => {
            // Check if we already have this order (to avoid duplicates from multiple items in same order)
            if (!map.has(i.orders.id)) {
                // Handle Supabase array response for joined customer
                const customer = Array.isArray(i.orders.customer) ? i.orders.customer[0] : i.orders.customer;
                const customerName = customer?.name || customer?.email || 'Guest';

                // Find product name from our map
                const productName = productMap.get(i.product_id)?.name || 'Unknown Product';

                map.set(i.orders.id, {
                    id: i.orders.id,
                    orderId: `#ORD-${i.orders.id.slice(0, 6).toUpperCase()}`,
                    customerName: customerName,
                    date: i.orders.created_at,
                    amount: i.quantity * i.price_per_item, // Note: This is per-item amount, strictly. Dashboard usually shows total order amount or item amount? 
                    // 'getAllSellerOrders' sums it up. Here we just take the first item's value or the order's total? 
                    // Interface says 'amount', usually total. Let's use order total if available?
                    // The 'orders' table has 'total_amount'. Let's strictly use that if possible?
                    // Previous query selected 'total_amount' from orders but didn't use it in mapping?
                    // Let's use i.quantity * i.price for this specific item row to show "Recent Sales" context, 
                    // OR map to order total nicely. 
                    // RecentOrders interface is simple. Let's stick to the previous logic: quantity * price.
                    status: i.orders.status,
                    productName: productName
                });
            }
        });

        return Array.from(map.values());
    }


    /* ===================== ALL ORDERS (Orders Page) ===================== */

    getAllSellerOrders(sellerId: string): Observable<any[]> {
        return from(this.fetchAllSellerOrders(sellerId)).pipe(
            catchError(err => {
                console.error('All orders error:', err);
                return of([]);
            })
        );
    }

    private async fetchAllSellerOrders(sellerId: string): Promise<any[]> {
        const client = this.supabase.getClient();

        console.log('📦 Fetching orders for seller:', sellerId);

        // 1. Get all products for this seller
        const { data: products } = await client
            .from('products')
            .select('id')
            .eq('seller_id', sellerId);

        console.log('📦 Products found:', products?.length, products);
        if (!products?.length) return [];

        if (!products?.length) return [];

        const productIds = products.map(p => p.id);

        // 2. Get order items linked to these products
        // We select the order details via the foreign key
        const { data: items, error } = await client
            .from('order_items')
            .select(`
                id,
                quantity,
                price_per_item,
                product:products!inner(name),
                order:orders!inner(
                    id,
                    status,
                    created_at,
                    total_amount,
                    customer:profiles!customer_id(name, email)
                )
            `)
            .in('product_id', productIds)
            .order('created_at', { foreignTable: 'orders', ascending: false });

        if (error) throw error;
        if (!items?.length) return [];

        // 3. Group items by Order ID
        const ordersMap = new Map<string, any>();

        items.forEach(item => {
            // Fix TS errors: Supabase returns arrays for joined tables
            const orderObj = Array.isArray(item.order) ? item.order[0] : item.order;
            const productObj = Array.isArray(item.product) ? item.product[0] : item.product;
            const customerObj = orderObj.customer && Array.isArray(orderObj.customer) ? orderObj.customer[0] : orderObj.customer;

            const orderId = orderObj.id;

            if (!ordersMap.has(orderId)) {
                ordersMap.set(orderId, {
                    id: ordersMap.size + 1, // Use index as ID for now or keep UUID? Component expects number? 
                    // Component expects 'id: number' in mock data, but we should use string or map it.
                    // Let's use the real UUID as 'orderId' and index for table 'id' if needed.
                    // Actually, let's stick to the mock structure but mostly real data.
                    orderNumber: 'ORD-' + orderId.substring(0, 8).toUpperCase(),
                    uuid: orderId, // Keep real ID
                    customerName: customerObj?.name || 'Unknown',
                    customerEmail: customerObj?.email || 'N/A',
                    items: [], // Will populate
                    totalAmount: 0, // Will sum up items
                    status: orderObj.status,
                    date: new Date(orderObj.created_at).toISOString().split('T')[0],
                    time: new Date(orderObj.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    avatarUrl: 'https://ui-avatars.com/api/?name=' + (customerObj?.name || 'U'),
                    relativeTime: orderObj.created_at, // Will need formatting in component or here
                    isRead: true, // Default
                    isArchived: false
                });
            }

            const order = ordersMap.get(orderId);
            if (productObj) {
                order.items.push(productObj.name);
            }
            order.totalAmount += (item.quantity * item.price_per_item);
        });

        console.log('📦 Mapped orders count:', ordersMap.size);
        return Array.from(ordersMap.values());
    }
}

