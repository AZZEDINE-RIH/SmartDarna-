import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map, catchError, of } from 'rxjs';

export interface Order {
  id: string;
  user_id?: string;
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  seller_ids?: string[];
  total_amount: number;
  status: string;
  payment_method?: string | null;
  payment_status?: string | null;
  created_at: string;
  updated_at?: string;
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

export interface OrderStatusHistoryEntry {
  id: string;
  order_id: string;
  changed_by?: string | null;
  changed_by_name?: string;
  old_status?: string | null;
  new_status?: string | null;
  note?: string | null;
  changed_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private supabaseService: SupabaseService) {}

  private async fetchOrders(limit?: number): Promise<any[]> {
    const client = this.supabaseService.getClient();
    const session = this.supabaseService.getCurrentSession();
    console.log('fetchOrders: session user:', session?.user?.id, session?.user?.email);

    try {
      let query = client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (typeof limit === 'number') {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) {
        console.error('fetchOrders: first attempt failed:', error);
        throw error;
      }

      return data || [];
    } catch (err) {
      if (err) {
        console.error('fetchOrders: retrying after error:', err);
      }
      const { data, error } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(typeof limit === 'number' ? limit : 1000);

      if (error) {
        console.error('fetchOrders: second attempt failed:', error);
        return [];
      }

      return data || [];
    }
  }

  private async enrichOrdersWithPayments(orderIds: string[]): Promise<Map<string, { method?: string | null; status?: string | null }>> {
    const client = this.supabaseService.getClient();
    const mapByOrder = new Map<string, { method?: string | null; status?: string | null }>();

    if (!orderIds || orderIds.length === 0) {
      return mapByOrder;
    }

    try {
      const { data, error } = await client
        .from('payments')
        .select('order_id, method, status, created_at')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return mapByOrder;
      }

      for (const p of data as any[]) {
        const orderId = p?.order_id;
        if (!orderId) continue;
        if (mapByOrder.has(orderId)) continue;
        mapByOrder.set(orderId, { method: p?.method ?? null, status: p?.status ?? null });
      }

      return mapByOrder;
    } catch {
      return mapByOrder;
    }
  }

  private async enrichOrdersWithProfiles(baseOrders: any[]): Promise<Map<string, { name?: string; email?: string }>> {
    const client = this.supabaseService.getClient();
    const mapById = new Map<string, { name?: string; email?: string }>();

    const ids = Array.from(
      new Set(
        (baseOrders || [])
          .map((o: any) => o?.customer_id || o?.user_id)
          .filter((id: any) => typeof id === 'string' && id.length > 0)
      )
    );

    if (ids.length === 0) {
      return mapById;
    }

    try {
      const { data, error } = await client
        .from('profiles')
        .select('id, name, full_name, email')
        .in('id', ids);

      if (error || !data) {
        return mapById;
      }

      for (const p of data as any[]) {
        mapById.set(p.id, {
          name: p.full_name || p.name || undefined,
          email: p.email || undefined
        });
      }

      return mapById;
    } catch {
      return mapById;
    }
  }

  private async enrichOrdersWithSellerIds(orderIds: string[]): Promise<Map<string, string[]>> {
    const client = this.supabaseService.getClient();
    const sellersByOrder = new Map<string, Set<string>>();

    if (!orderIds || orderIds.length === 0) {
      return new Map();
    }

    try {
      const { data, error } = await client
        .from('order_items')
        .select('order_id, products(seller_id)')
        .in('order_id', orderIds);

      if (error || !data) {
        return new Map();
      }

      for (const row of data as any[]) {
        const orderId = row?.order_id;
        const product = Array.isArray(row?.products) ? row.products[0] : row?.products;
        const sellerId = product?.seller_id;

        if (!orderId || !sellerId) continue;
        if (!sellersByOrder.has(orderId)) {
          sellersByOrder.set(orderId, new Set<string>());
        }
        sellersByOrder.get(orderId)!.add(sellerId);
      }

      const result = new Map<string, string[]>();
      for (const [orderId, set] of sellersByOrder.entries()) {
        result.set(orderId, Array.from(set));
      }
      return result;
    } catch {
      return new Map();
    }
  }

  /**
   * Get all orders with customer details
   */
  getAllOrders(): Observable<Order[]> {
    return from(
      (async () => {
        const orders = await this.fetchOrders();
        if (!orders || orders.length === 0) {
          return [] as Order[];
        }

        const profilesById = await this.enrichOrdersWithProfiles(orders);
        const orderIds = orders.map((o: any) => o?.id).filter((id: any) => typeof id === 'string');
        const sellerIdsByOrder = await this.enrichOrdersWithSellerIds(orderIds);
        const paymentsByOrder = await this.enrichOrdersWithPayments(orderIds);

        return (orders || []).map((order: any) => {
          const customerId = order.customer_id || order.user_id || undefined;
          const profile = customerId ? profilesById.get(customerId) : undefined;
          const sellerIds = sellerIdsByOrder.get(order.id) || [];
          const payment = paymentsByOrder.get(order.id);

          return {
            id: order.id,
            user_id: order.user_id,
            customer_id: order.customer_id,
            customer_name: profile?.name || order.customer_name || 'Unknown',
            customer_email: profile?.email || order.customer_email || undefined,
            seller_ids: sellerIds,
            total_amount: Number(order.total_amount ?? order.total_price ?? 0),
            status: order.status || 'pending',
            payment_method: payment?.method ?? order.payment_method ?? null,
            payment_status: order.payment_status ?? null,
            created_at: order.created_at,
            updated_at: order.updated_at
          } as Order;
        });
      })()
    ).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Get recent orders (last 10)
   */
  getRecentOrders(limit: number = 10): Observable<Order[]> {
    return from(
      (async () => {
        const orders = await this.fetchOrders(limit);
        if (!orders || orders.length === 0) {
          return [] as Order[];
        }

        const profilesById = await this.enrichOrdersWithProfiles(orders);
        const orderIds = orders.map((o: any) => o?.id).filter((id: any) => typeof id === 'string');
        const sellerIdsByOrder = await this.enrichOrdersWithSellerIds(orderIds);
        const paymentsByOrder = await this.enrichOrdersWithPayments(orderIds);

        return (orders || []).map((order: any) => {
          const customerId = order.customer_id || order.user_id || undefined;
          const profile = customerId ? profilesById.get(customerId) : undefined;
          const sellerIds = sellerIdsByOrder.get(order.id) || [];
          const payment = paymentsByOrder.get(order.id);

          return {
            id: order.id,
            user_id: order.user_id,
            customer_id: order.customer_id,
            customer_name: profile?.name || order.customer_name || 'Unknown',
            customer_email: profile?.email || order.customer_email || undefined,
            seller_ids: sellerIds,
            total_amount: Number(order.total_amount ?? order.total_price ?? 0),
            status: order.status || 'pending',
            payment_method: payment?.method ?? order.payment_method ?? null,
            payment_status: order.payment_status ?? payment?.status ?? null,
            created_at: order.created_at,
            updated_at: order.updated_at
          } as Order;
        });
      })()
    ).pipe(
      catchError(() => of([]))
    );
  }

  updateOrderStatus(orderId: string, status: string): Observable<boolean> {
    return from(
      this.supabaseService.getClient()
        .from('orders')
        .update({ status })
        .eq('id', orderId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error updating order status:', error);
          return false;
        }
        return true;
      }),
      catchError((err) => {
        console.error('Error in updateOrderStatus:', err);
        return of(false);
      })
    );
  }

  /**
   * Get order by ID with items
   */
  getOrderById(id: string): Observable<(Order & { items: OrderItem[] }) | null> {
    return from(
      (async () => {
        const client = this.supabaseService.getClient();

        const { data: order, error: orderError } = await client
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (orderError || !order) {
          if (orderError) {
            console.error('Error fetching order:', orderError);
          }
          return null;
        }

        const profilesById = await this.enrichOrdersWithProfiles([order]);
        const customerId = order.customer_id || order.user_id || undefined;
        const profile = customerId ? profilesById.get(customerId) : undefined;

        let itemsData: any[] = [];
        try {
          const { data, error } = await client
            .from('order_items')
            .select('id, order_id, product_id, quantity, unit_price, subtotal, products(name, seller_id)')
            .eq('order_id', id);
          if (!error && data) {
            itemsData = data as any[];
          }
        } catch {
        }

        if (!itemsData || itemsData.length === 0) {
          try {
            const { data } = await client
              .from('order_items')
              .select('id, order_id, product_id, quantity, price_per_item, price, products(name, seller_id)')
              .eq('order_id', id);
            if (data) {
              itemsData = data as any[];
            }
          } catch {
          }
        }

        const sellerIds = Array.from(
          new Set(
            (itemsData || [])
              .map((row: any) => {
                const p = Array.isArray(row?.products) ? row.products[0] : row?.products;
                return p?.seller_id;
              })
              .filter((v: any) => typeof v === 'string' && v.length > 0)
          )
        );

        let payment: { method?: string | null; status?: string | null } | undefined;
        try {
          const { data } = await client
            .from('payments')
            .select('method, status, created_at')
            .eq('order_id', id)
            .order('created_at', { ascending: false })
            .limit(1);
          const p = data && data[0] ? data[0] : null;
          if (p) {
            payment = { method: (p as any).method ?? null, status: (p as any).status ?? null };
          }
        } catch {
        }

        const mappedItems: OrderItem[] = (itemsData || []).map((item: any) => {
          const product = Array.isArray(item?.products) ? item.products[0] : item?.products;
          const quantity = Number(item?.quantity ?? 0);
          const unitPrice = Number(item?.unit_price ?? item?.price_per_item ?? item?.price ?? 0);
          const subtotal = Number(item?.subtotal ?? (quantity * unitPrice));

          return {
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            product_name: product?.name || 'Unknown',
            quantity,
            unit_price: unitPrice,
            subtotal
          };
        });

        return {
          id: order.id,
          user_id: order.user_id,
          customer_id: order.customer_id,
          customer_name: profile?.name || order.customer_name || 'Unknown',
          customer_email: profile?.email || order.customer_email || undefined,
          seller_ids: sellerIds,
          total_amount: Number(order.total_amount ?? order.total_price ?? 0),
          status: order.status || 'pending',
          payment_method: payment?.method ?? order.payment_method ?? null,
          payment_status: order.payment_status ?? payment?.status ?? null,
          created_at: order.created_at,
          updated_at: order.updated_at,
          items: mappedItems
        };
      })()
    ).pipe(
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
      (async () => {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
          .from('orders')
          .select('*')
          .eq('status', status)
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          return [] as Order[];
        }

        const profilesById = await this.enrichOrdersWithProfiles(data);
        const orderIds = (data || []).map((o: any) => o?.id).filter((id: any) => typeof id === 'string');
        const sellerIdsByOrder = await this.enrichOrdersWithSellerIds(orderIds);
        const paymentsByOrder = await this.enrichOrdersWithPayments(orderIds);

        return (data || []).map((order: any) => {
          const customerId = order.customer_id || order.user_id || undefined;
          const profile = customerId ? profilesById.get(customerId) : undefined;
          const sellerIds = sellerIdsByOrder.get(order.id) || [];
          const payment = paymentsByOrder.get(order.id);

          return {
            id: order.id,
            user_id: order.user_id,
            customer_id: order.customer_id,
            customer_name: profile?.name || order.customer_name || 'Unknown',
            customer_email: profile?.email || order.customer_email || undefined,
            seller_ids: sellerIds,
            total_amount: Number(order.total_amount ?? order.total_price ?? 0),
            status: order.status || 'pending',
            payment_method: payment?.method ?? order.payment_method ?? null,
            payment_status: order.payment_status ?? payment?.status ?? null,
            created_at: order.created_at,
            updated_at: order.updated_at
          } as Order;
        });
      })()
    ).pipe(
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
        .eq('status', 'completed')
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

  listenForNewOrders(): Observable<any> {
    return new Observable((observer) => {
      const client = this.supabaseService.getClient();
      const channel = client
        .channel('orders-inserts')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'orders' },
          (payload: any) => {
            observer.next(payload?.new);
          }
        );

      channel.subscribe((status: any) => {
        if (status === 'CHANNEL_ERROR') {
          observer.error(new Error('Realtime channel error'));
        }
      });

      return () => {
        try {
          void client.removeChannel(channel);
        } catch {
        }
      };
    });
  }

  getOrderStatusHistory(orderId: string): Observable<OrderStatusHistoryEntry[]> {
    return from(
      (async () => {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
          .from('order_status_history')
          .select('*')
          .eq('order_id', orderId)
          .order('changed_at', { ascending: false });

        if (error || !data || data.length === 0) {
          return [] as OrderStatusHistoryEntry[];
        }

        const ids = Array.from(
          new Set(
            (data as any[])
              .map((h: any) => h?.changed_by)
              .filter((v: any) => typeof v === 'string' && v.length > 0)
          )
        );

        const namesById = new Map<string, string>();
        if (ids.length > 0) {
          try {
            const { data: profiles } = await client
              .from('profiles')
              .select('id, name, full_name, email')
              .in('id', ids);

            for (const p of (profiles as any[]) || []) {
              const name = p?.full_name || p?.name || p?.email;
              if (p?.id && name) {
                namesById.set(p.id, name);
              }
            }
          } catch {
          }
        }

        return (data as any[]).map((h: any) => ({
          id: h.id,
          order_id: h.order_id,
          changed_by: h.changed_by ?? null,
          changed_by_name: h.changed_by ? (namesById.get(h.changed_by) || undefined) : undefined,
          old_status: h.old_status ?? null,
          new_status: h.new_status ?? null,
          note: h.note ?? null,
          changed_at: h.changed_at
        } as OrderStatusHistoryEntry));
      })()
    ).pipe(
      catchError(() => of([]))
    );
  }
}
