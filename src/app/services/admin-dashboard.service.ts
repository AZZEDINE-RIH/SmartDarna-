import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map, catchError, of, switchMap, forkJoin } from 'rxjs';

export interface DashboardKPIs {
  totalUsers: number | null;
  totalSellers: number | null;
  totalRevenue: number | null;
}

export interface CategoryRevenue {
  category_name: string;
  revenue: number;
}

export interface SellerRequest {
  id: string;
  user_id: string;
  shop_name: string;
  status: 'pending' | 'approved' | 'rejected';
  full_name: string;
  email?: string;
}

export interface RecentTransaction {
  id: string;
  order_id: string;
  customer_name: string;
  product_name: string;
  amount: number;
  status: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get total users count (role = 'user')
   */
  getTotalUsers(): Observable<number | null> {
    return from(
      this.supabaseService.getClient()
        .from('profiles')
        .select('*', { count: 'exact', head: false })
        .eq('role', 'user')
    ).pipe(
      map(({ data, count, error }) => {
        if (error) {
          console.error('Error fetching total users:', error);
          return null;
        }
        return count ?? (data?.length ?? null);
      }),
      catchError((err) => {
        console.error('Error in getTotalUsers:', err);
        return of(null);
      })
    );
  }

  /**
   * Get total approved sellers count
   */
  getTotalSellers(): Observable<number | null> {
    return from(
      this.supabaseService.getClient()
        .from('sellers')
        .select('*', { count: 'exact', head: false })
        .eq('status', 'approved')
    ).pipe(
      map(({ data, count, error }) => {
        if (error) {
          console.error('Error fetching total sellers:', error);
          return null;
        }
        return count ?? (data?.length ?? null);
      }),
      catchError((err) => {
        console.error('Error in getTotalSellers:', err);
        return of(null);
      })
    );
  }

  /**
   * Get total revenue from payments
   */
  getTotalRevenue(): Observable<number | null> {
    return from(
      this.supabaseService.getClient()
        .from('payments')
        .select('amount')
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching total revenue:', error);
          return null;
        }
        if (!data || data.length === 0) {
          return null;
        }
        const total = data.reduce((sum: number, payment: any) => {
          return sum + (parseFloat(payment.amount) || 0);
        }, 0);
        return total;
      }),
      catchError((err) => {
        console.error('Error in getTotalRevenue:', err);
        return of(null);
      })
    );
  }

  /**
   * Get all KPIs at once
   */
  getKPIs(): Observable<DashboardKPIs> {
    return forkJoin({
      totalUsers: this.getTotalUsers(),
      totalSellers: this.getTotalSellers(),
      totalRevenue: this.getTotalRevenue()
    }).pipe(
      catchError((err) => {
        console.error('Error fetching KPIs:', err);
        return of({
          totalUsers: null,
          totalSellers: null,
          totalRevenue: null
        });
      })
    );
  }

  /**
   * Get product performance by category (last 30 days)
   * Join: orders -> products -> categories
   * Fallback: If categories table doesn't exist, group by product name
   */
  getProductPerformanceByCategory(): Observable<CategoryRevenue[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return from(
      this.supabaseService.getClient()
        .from('orders')
        .select(`
          total_price,
          created_at,
          products(
            id,
            name,
            category_id,
            categories(
              id,
              name
            )
          )
        `)
        .gte('created_at', thirtyDaysAgo.toISOString())
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) {
          console.error('Error fetching product performance:', error);
          // Try fallback query without categories
          return this.getProductPerformanceFallback(thirtyDaysAgo);
        }
        if (!data || data.length === 0) {
          return of([]);
        }

        // Group by category and sum revenue
        const categoryMap = new Map<string, number>();
        
        data.forEach((order: any) => {
          let categoryName = 'Uncategorized';
          
          if (order.products?.categories?.name) {
            categoryName = order.products.categories.name;
          } else if (order.products?.name) {
            // Fallback: use product name if no category
            categoryName = order.products.name;
          }
          
          const amount = parseFloat(order.total_price || order.total_amount || '0') || 0;
          const current = categoryMap.get(categoryName) || 0;
          categoryMap.set(categoryName, current + amount);
        });

        const result = Array.from(categoryMap.entries()).map(([category_name, revenue]) => ({
          category_name,
          revenue
        }));
        return of(result);
      }),
      catchError((err) => {
        console.error('Error in getProductPerformanceByCategory:', err);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return this.getProductPerformanceFallback(thirtyDaysAgo);
      })
    );
  }

  /**
   * Fallback method if categories join fails
   */
  private getProductPerformanceFallback(thirtyDaysAgo: Date): Observable<CategoryRevenue[]> {
    return from(
      this.supabaseService.getClient()
        .from('orders')
        .select(`
          total_price,
          created_at,
          products(
            name
          )
        `)
        .gte('created_at', thirtyDaysAgo.toISOString())
    ).pipe(
      map(({ data, error }) => {
        if (error || !data || data.length === 0) {
          return [];
        }

        const categoryMap = new Map<string, number>();
        
        data.forEach((order: any) => {
          const categoryName = order.products?.name || 'Uncategorized';
          const amount = parseFloat(order.total_price || order.total_amount || '0') || 0;
          const current = categoryMap.get(categoryName) || 0;
          categoryMap.set(categoryName, current + amount);
        });

        return Array.from(categoryMap.entries()).map(([category_name, revenue]) => ({
          category_name,
          revenue
        }));
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Get pending seller requests
   */
  getPendingSellers(): Observable<SellerRequest[]> {
    return from(
      this.supabaseService.getClient()
        .from('sellers')
        .select(`
          id,
          user_id,
          shop_name,
          status,
          profiles(
            full_name,
            name,
            email
          )
        `)
        .eq('status', 'pending')
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching pending sellers:', error);
          return [];
        }
        if (!data || data.length === 0) {
          return [];
        }

        return data.map((seller: any) => {
          const profile = Array.isArray(seller.profiles) ? seller.profiles[0] : seller.profiles;
          return {
            id: seller.id,
            user_id: seller.user_id,
            shop_name: seller.shop_name,
            status: seller.status,
            full_name: profile?.full_name || profile?.name || 'N/A',
            email: profile?.email || 'N/A'
          };
        });
      }),
      catchError((err) => {
        console.error('Error in getPendingSellers:', err);
        return of([]);
      })
    );
  }

  /**
   * Approve a seller request
   */
  approveSeller(sellerId: string): Observable<boolean> {
    return from(
      this.supabaseService.getClient()
        .from('sellers')
        .update({ status: 'approved' })
        .eq('id', sellerId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error approving seller:', error);
          return false;
        }
        return true;
      }),
      catchError((err) => {
        console.error('Error in approveSeller:', err);
        return of(false);
      })
    );
  }

  /**
   * Reject a seller request
   */
  rejectSeller(sellerId: string): Observable<boolean> {
    return from(
      this.supabaseService.getClient()
        .from('sellers')
        .update({ status: 'rejected' })
        .eq('id', sellerId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error rejecting seller:', error);
          return false;
        }
        return true;
      }),
      catchError((err) => {
        console.error('Error in rejectSeller:', err);
        return of(false);
      })
    );
  }

  /**
   * Get recent transactions (last 5 orders)
   * Join: orders -> profiles (customer) -> products -> payments
   */
  getRecentTransactions(): Observable<RecentTransaction[]> {
    return from(
      this.supabaseService.getClient()
        .from('orders')
        .select(`
          id,
          total_price,
          total_amount,
          status,
          created_at,
          user_id,
          product_id,
          profiles(
            full_name,
            name
          ),
          products(
            name,
            title
          ),
          payments(
            amount
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching recent transactions:', error);
          return [];
        }
        if (!data || data.length === 0) {
          return [];
        }

        return data.map((order: any) => {
          const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
          const product = Array.isArray(order.products) ? order.products[0] : order.products;
          
          return {
            id: order.id,
            order_id: order.id,
            customer_name: profile?.full_name || profile?.name || 'Unknown',
            product_name: product?.name || product?.title || 'Unknown Product',
            amount: parseFloat(
              order.payments?.[0]?.amount || 
              order.total_price || 
              order.total_amount || 
              '0'
            ) || 0,
            status: order.status || 'pending',
            date: order.created_at
          };
        });
      }),
      catchError((err) => {
        console.error('Error in getRecentTransactions:', err);
        return of([]);
      })
    );
  }
}
