import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

export interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalRevenue: number;
  pendingSellers: number;
  totalOrders: number;
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

export interface CategoryRevenue {
  category_name: string;
  revenue: number;
}

export interface UserGrowth {
  current_month: number;
  previous_month: number;
  growth_percentage: number;
}

export interface OrderGrowth {
  current_month: number;
  previous_month: number;
  growth_percentage: number;
}

export interface RevenueGrowth {
  current_month: number;
  previous_month: number;
  growth_percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStatsService {
  constructor(private supabaseService: SupabaseService) {}

  private readonly finalizedOrderStatuses = ['completed', 'delivered'];

  /**
   * Get all dashboard statistics from database
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [
        usersResult,
        sellersResult, 
        productsResult,
        ordersResult,
        pendingSellersResult
      ] = await Promise.all([
        this.getTotalUsers(),
        this.getTotalSellers(),
        this.getTotalProducts(),
        this.getTotalOrders(),
        this.getPendingSellers()
      ]);

      const totalRevenue = await this.getTotalRevenue();

      return {
        totalUsers: usersResult,
        totalSellers: sellersResult,
        totalProducts: productsResult,
        totalRevenue: totalRevenue,
        pendingSellers: pendingSellersResult,
        totalOrders: ordersResult
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalUsers: 0,
        totalSellers: 0,
        totalProducts: 0,
        totalRevenue: 0,
        pendingSellers: 0,
        totalOrders: 0
      };
    }

  }

  async getSellersGrowth(): Promise<{ growth: number; percentage: string }> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    try {
      const [currentMonthSellers, previousMonthSellers] = await Promise.all([
        this.getProfilesCountInDateRange(currentMonthStart, now, 'seller'),
        this.getProfilesCountInDateRange(previousMonthStart, previousMonthEnd, 'seller')
      ]);

      const growth = currentMonthSellers - previousMonthSellers;
      const percentage = previousMonthSellers > 0
        ? ((growth / previousMonthSellers) * 100).toFixed(1)
        : '0';

      return {
        growth,
        percentage: growth >= 0 ? `+${percentage}%` : `${percentage}%`
      };
    } catch (error) {
      console.error('Error calculating sellers growth:', error);
      return { growth: 0, percentage: '0%' };
    }
  }

  /**
   * Get total users count
   */
  async getTotalUsers(): Promise<number> {
    const { count, error } = await this.supabaseService.getClient()
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'user');

    if (error) {
      console.error('Error fetching total users:', error);
      return 0;
    }

    return count ?? 0;
  }

  /**
   * Get total sellers count
   */
  async getTotalSellers(): Promise<number> {
    const { count, error } = await this.supabaseService.getClient()
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'seller');

    if (error) {
      console.error('Error fetching total sellers:', error);
      return 0;
    }

    return count ?? 0;
  }

  /**
   * Get total products count
   */
  async getTotalProducts(): Promise<number> {
    const { count, error } = await this.supabaseService.getClient()
      .from('products')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching total products:', error);
      return 0;
    }

    return count ?? 0;
  }

  /**
   * Get total orders count
   */
  async getTotalOrders(): Promise<number> {
    const { count, error } = await this.supabaseService.getClient()
      .from('orders')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching total orders:', error);
      return 0;
    }

    return count ?? 0;
  }

  /**
   * Get pending sellers count
   */
  async getPendingSellers(): Promise<number> {
    const { count, error } = await this.supabaseService.getClient()
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'seller')
      .eq('is_active', false);

    if (error) {
      console.error('Error fetching pending sellers:', error);
      return 0;
    }

    return count ?? 0;
  }

  /**
   * Get total revenue from all orders
   */
  async getTotalRevenue(): Promise<number> {
    const { data, error } = await this.supabaseService.getClient()
      .from('order_items')
      .select('quantity, price_per_item');

    if (error) {
      console.error('Error fetching total revenue:', error);
      return 0;
    }

    return data?.reduce((sum: number, item: any) => {
      const qty = item?.quantity ?? 0;
      const price = item?.price_per_item ?? 0;
      return sum + qty * price;
    }, 0) || 0;
  }

  /**
   * Get revenue by category
   */
  async getRevenueByCategory(): Promise<CategoryRevenue[]> {
    const { data: ordersData, error: ordersError } = await this.supabaseService.getClient()
      .from('orders')
      .select('id')
      .in('status', this.finalizedOrderStatuses);

    if (ordersError) {
      console.error('Error fetching finalized orders for revenue by category:', ordersError);
      return [];
    }

    const orderIds = (ordersData || []).map((o: any) => o.id).filter(Boolean);
    if (orderIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabaseService.getClient()
      .from('order_items')
      .select(`
        quantity,
        price_per_item,
        products(
          category_id
        )
      `)
      .in('order_id', orderIds);

    if (error) {
      console.error('Error fetching revenue by category:', error);
      return [];
    }

    const { data: categoriesData, error: categoriesError } = await this.supabaseService.getClient()
      .from('categories')
      .select('id, name');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    }

    const categoryNameById = new Map<string, string>();
    (categoriesData || []).forEach((c: any) => {
      if (c?.id) categoryNameById.set(c.id, c.name || 'Other');
    });

    const categoryRevenue: { [key: string]: number } = {};

    data?.forEach((row: any) => {
      const product = row.products as any;
      const categoryId = product?.category_id as string | undefined;
      const categoryName = (categoryId && categoryNameById.get(categoryId)) || 'Other';
      const amount = (row.quantity || 0) * (row.price_per_item || 0);
      categoryRevenue[categoryName] = (categoryRevenue[categoryName] || 0) + amount;
    });

    return Object.entries(categoryRevenue).map(([category_name, revenue]) => ({
      category_name,
      revenue
    }));
  }

  /**
   * Get users growth (current month vs previous month)
   */
  async getUsersGrowth(): Promise<{ growth: number; percentage: string }> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    try {
      const [currentMonthUsers, previousMonthUsers] = await Promise.all([
        this.getProfilesCountInDateRange(currentMonthStart, now, 'user'),
        this.getProfilesCountInDateRange(previousMonthStart, previousMonthEnd, 'user')
      ]);

      const growth = currentMonthUsers - previousMonthUsers;
      const percentage = previousMonthUsers > 0 
        ? ((growth / previousMonthUsers) * 100).toFixed(1)
        : '0';

      return {
        growth,
        percentage: growth >= 0 ? `+${percentage}%` : `${percentage}%`
      };
    } catch (error) {
      console.error('Error calculating users growth:', error);
      return { growth: 0, percentage: '0%' };
    }
  }

  /**
   * Get orders growth (current month vs previous month)
   */
  async getOrdersGrowth(): Promise<{ growth: number; percentage: string }> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    try {
      const [currentMonthOrders, previousMonthOrders] = await Promise.all([
        this.getOrdersCountInDateRange(currentMonthStart, now),
        this.getOrdersCountInDateRange(previousMonthStart, previousMonthEnd)
      ]);

      const growth = currentMonthOrders - previousMonthOrders;
      const percentage = previousMonthOrders > 0 
        ? ((growth / previousMonthOrders) * 100).toFixed(1)
        : '0';

      return {
        growth,
        percentage: growth >= 0 ? `+${percentage}%` : `${percentage}%`
      };
    } catch (error) {
      console.error('Error calculating orders growth:', error);
      return { growth: 0, percentage: '0%' };
    }
  }

  /**
   * Get revenue growth (current month vs previous month)
   */
  async getRevenueGrowth(): Promise<{ growth: number; percentage: string }> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    try {
      const [currentMonthRevenue, previousMonthRevenue] = await Promise.all([
        this.getRevenueInDateRange(currentMonthStart, now),
        this.getRevenueInDateRange(previousMonthStart, previousMonthEnd)
      ]);

      const growth = currentMonthRevenue - previousMonthRevenue;
      const percentage = previousMonthRevenue > 0 
        ? ((growth / previousMonthRevenue) * 100).toFixed(1)
        : '0';

      return {
        growth,
        percentage: growth >= 0 ? `+${percentage}%` : `${percentage}%`
      };
    } catch (error) {
      console.error('Error calculating revenue growth:', error);
      return { growth: 0, percentage: '0%' };
    }
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 10): Promise<RecentTransaction[]> {
    const { data, error } = await this.supabaseService.getClient()
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        profiles:profiles!orders_customer_id_fkey(
          name
        ),
        order_items!inner(
          products!inner(
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }

    return data?.map((order: any) => {
      // Handle the nested structure correctly
      const profile = order.profiles as any;
      const orderItems = order.order_items as any[];
      
      let productName = 'Multiple items';
      if (orderItems && orderItems.length > 0) {
        const firstItem = orderItems[0];
        const product = firstItem.products as any;
        productName = product?.name || 'Unknown product';
      }

      return {
        id: order.id,
        order_id: order.id,
        customer_name: profile?.name || 'Unknown',
        product_name: productName,
        amount: order.total_amount || 0,
        status: order.status || 'pending',
        date: order.created_at
      };
    }) || [];
  }

  /**
   * Helper method to get users count in date range
   */
  private async getUsersCountInDateRange(startDate: Date, endDate: Date): Promise<number> {
    return this.getProfilesCountInDateRange(startDate, endDate, 'user');
  }

  private async getProfilesCountInDateRange(
    startDate: Date,
    endDate: Date,
    role?: 'user' | 'seller' | 'admin'
  ): Promise<number> {
    let query = this.supabaseService.getClient()
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (role) {
      query = query.eq('role', role);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error fetching profiles count in date range:', error);
      return 0;
    }

    return count ?? 0;
  }

  /**
   * Helper method to get orders count in date range
   */
  private async getOrdersCountInDateRange(startDate: Date, endDate: Date): Promise<number> {
    const { count, error } = await this.supabaseService.getClient()
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      console.error('Error fetching orders count in date range:', error);
      return 0;
    }

    return count ?? 0;
  }

  /**
   * Helper method to get revenue in date range
   */
  private async getRevenueInDateRange(startDate: Date, endDate: Date): Promise<number> {
    const { data, error } = await this.supabaseService.getClient()
      .from('orders')
      .select('total_amount')
      .in('status', this.finalizedOrderStatuses)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      console.error('Error fetching revenue in date range:', error);
      return 0;
    }

    return data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  }

  /**
   * Get weekly revenue data for charts
   */
  async getWeeklyRevenue(): Promise<{ day: string; revenue: number }[]> {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const { data, error } = await this.supabaseService.getClient()
      .from('orders')
      .select('total_amount, created_at')
      .in('status', this.finalizedOrderStatuses)
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', now.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching weekly revenue:', error);
      return [];
    }

    // Group by day of week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueByDay: { [key: string]: number } = {};
    
    // Initialize all days with 0
    days.forEach(day => revenueByDay[day] = 0);

    data?.forEach(order => {
      const day = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'short' });
      revenueByDay[day] = (revenueByDay[day] || 0) + (order.total_amount || 0);
    });

    return days.map(day => ({
      day,
      revenue: revenueByDay[day]
    }));
  }
}
