import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map, catchError, of } from 'rxjs';

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get all orders with customer details
   */
  getAllOrders(): Observable<Order[]> {
    return from(
      this.supabaseService.getClient()
        .from('orders')
        .select(`
          id,
          user_id,
          profiles(name),
          total_amount,
          status,
          payment_status,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching orders:', error);
          return [];
        }
        if (!data || data.length === 0) {
          return [];
        }

        return data.map((order: any) => ({
          id: order.id,
          user_id: order.user_id,
          customer_name: (order.profiles as any)?.name || 'Unknown',
          total_amount: order.total_amount,
          status: order.status,
          payment_status: order.payment_status,
          created_at: order.created_at,
          updated_at: order.updated_at
        }));
      }),
      catchError((err) => {
        console.error('Error in getAllOrders:', err);
        return of([]);
      })
    );
  }

  /**
   * Get recent orders (last 10)
   */
  getRecentOrders(limit: number = 10): Observable<Order[]> {
    return from(
      this.supabaseService.getClient()
        .from('orders')
        .select(`
          id,
          user_id,
          profiles(name),
          total_amount,
          status,
          payment_status,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(limit)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching recent orders:', error);
          return [];
        }
        if (!data || data.length === 0) {
          return [];
        }

        return data.map((order: any) => ({
          id: order.id,
          user_id: order.user_id,
          customer_name: order.profiles?.name || 'Unknown',
          total_amount: order.total_amount,
          status: order.status,
          payment_status: order.payment_status,
          created_at: order.created_at,
          updated_at: order.updated_at
        }));
      }),
      catchError((err) => {
        console.error('Error in getRecentOrders:', err);
        return of([]);
      })
    );
  }

  /**
   * Get order by ID with items
   */
  getOrderById(id: string): Observable<(Order & { items: OrderItem[] }) | null> {
    return from(
      this.supabaseService.getClient()
        .from('orders')
        .select(`
          id,
          user_id,
          profiles(name),
          total_amount,
          status,
          payment_status,
          created_at,
          updated_at,
          order_items(
            id,
            order_id,
            product_id,
            products(name),
            quantity,
            unit_price,
            subtotal
          )
        `)
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching order:', error);
          return null;
        }
        if (!data) return null;

        return {
          id: data.id,
          user_id: data.user_id,
          customer_name: (data.profiles as any)?.name || 'Unknown',
          total_amount: data.total_amount,
          status: data.status,
          payment_status: data.payment_status,
          created_at: data.created_at,
          updated_at: data.updated_at,
          items: (data.order_items || []).map((item: any) => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            product_name: (item.products as any)?.name || 'Unknown',
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal
          }))
        };
      }),
      catchError((err) => {
        console.error('Error in getOrderById:', err);
        return of(null);
      })
    );
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: string): Observable<Order[]> {
    return from(
      this.supabaseService.getClient()
        .from('orders')
        .select(`
          id,
          user_id,
          profiles(name),
          total_amount,
          status,
          payment_status,
          created_at,
          updated_at
        `)
        .eq('status', status)
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching orders by status:', error);
          return [];
        }
        if (!data || data.length === 0) {
          return [];
        }

        return data.map((order: any) => ({
          id: order.id,
          user_id: order.user_id,
          customer_name: order.profiles?.name || 'Unknown',
          total_amount: order.total_amount,
          status: order.status,
          payment_status: order.payment_status,
          created_at: order.created_at,
          updated_at: order.updated_at
        }));
      }),
      catchError((err) => {
        console.error('Error in getOrdersByStatus:', err);
        return of([]);
      })
    );
  }

  /**
   * Get total orders count
   */
  getTotalOrdersCount(): Observable<number> {
    return from(
      this.supabaseService.getClient()
        .from('orders')
        .select('*', { count: 'exact', head: true })
    ).pipe(
      map(({ count, error }) => {
        if (error) {
          console.error('Error fetching orders count:', error);
          return 0;
        }
        return count ?? 0;
      }),
      catchError((err) => {
        console.error('Error in getTotalOrdersCount:', err);
        return of(0);
      })
    );
  }

  /**
   * Get total revenue
   */
  getTotalRevenue(): Observable<number> {
    return from(
      this.supabaseService.getClient()
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered')
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching total revenue:', error);
          return 0;
        }
        if (!data || data.length === 0) {
          return 0;
        }
        return data.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      }),
      catchError((err) => {
        console.error('Error in getTotalRevenue:', err);
        return of(0);
      })
    );
  }
}
