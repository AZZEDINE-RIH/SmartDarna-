import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map, catchError, of, forkJoin } from 'rxjs';

export interface DashboardKPIs {
  totalUsers: number | null;
  totalSellers: number | null;
  totalRevenue: number | null;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
}

export interface SellerRequest {
  id: string;
  sellerName: string;
  shopName: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  productName: string;
  amount: number;
  status: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  constructor(private supabase: SupabaseService) {}

  // 1. Total Users
  getTotalUsers(): Observable<number | null> {
    return from(
      this.supabase.getClient()
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user')
    ).pipe(
      map(res => res.count),
      catchError(err => {
        console.error('Error fetching total users:', err);
        return of(null);
      })
    );
  }

  // 2. Total Sellers
  getTotalSellers(): Observable<number | null> {
    return from(
      this.supabase.getClient()
        .from('sellers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
    ).pipe(
      map(res => res.count),
      catchError(err => {
        console.error('Error fetching total sellers:', err);
        return of(null);
      })
    );
  }

  // 3. Total Revenue
  getTotalRevenue(): Observable<number | null> {
    return from(
      this.supabase.getClient()
        .from('payments')
        .select('amount')
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return (res.data || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      }),
      catchError(err => {
        console.error('Error fetching total revenue:', err);
        return of(null);
      })
    );
  }

  // 4. Product Performance (Revenue by Category)
  getProductPerformance(): Observable<CategoryRevenue[]> {
    // Note: 'order_items' table does not exist in schema, using 'orders' -> 'products' -> 'categories'
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return from(
      this.supabase.getClient()
        .from('orders')
        .select(`
          total_amount,
          created_at,
          products (
            categories (
              name
            )
          )
        `)
        .gte('created_at', thirtyDaysAgo.toISOString())
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        
        const categoryMap = new Map<string, number>();
        
        res.data?.forEach((order: any) => {
          const category = order.products?.categories?.name || 'Uncategorized';
          const amount = Number(order.total_amount) || 0;
          categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
        });

        return Array.from(categoryMap.entries()).map(([category, revenue]) => ({
          category,
          revenue
        }));
      }),
      catchError(err => {
        console.error('Error fetching product performance:', err);
        return of([]);
      })
    );
  }

  // 5. Seller Requests
  getSellerRequests(): Observable<SellerRequest[]> {
    return from(
      this.supabase.getClient()
        .from('sellers')
        .select(`
          id,
          shop_name,
          status,
          profiles (
            name,
            email
          )
        `)
        .eq('status', 'pending')
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return (res.data || []).map((s: any) => ({
          id: s.id,
          sellerName: s.profiles?.name || s.profiles?.email || 'Unknown',
          shopName: s.shop_name,
          status: s.status
        }));
      }),
      catchError(err => {
        console.error('Error fetching seller requests:', err);
        return of([]);
      })
    );
  }

  // Actions for Seller Requests
  updateSellerStatus(id: string, status: 'approved' | 'rejected'): Observable<boolean> {
    return from(
      this.supabase.getClient()
        .from('sellers')
        .update({ status })
        .eq('id', id)
    ).pipe(
      map(res => !res.error),
      catchError(err => {
        console.error(`Error updating seller status to ${status}:`, err);
        return of(false);
      })
    );
  }

  // 6. Recent Transactions
  getRecentTransactions(): Observable<Transaction[]> {
    return from(
      this.supabase.getClient()
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          profiles (
            name,
            email
          ),
          products (
            name
          ),
          payments (
            amount
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return (res.data || []).map((o: any) => ({
          id: o.id,
          orderId: o.id, // Using UUID as Order ID
          customerName: o.profiles?.name || o.profiles?.email || 'Unknown',
          productName: o.products?.name || 'Unknown Product',
          amount: Number(o.payments?.[0]?.amount || o.total_amount || 0),
          status: o.status,
          date: o.created_at
        }));
      }),
      catchError(err => {
        console.error('Error fetching recent transactions:', err);
        return of([]);
      })
    );
  }
}
