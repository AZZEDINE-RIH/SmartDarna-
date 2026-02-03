import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStatsService } from '../../../../services/dashboard-stats.service';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overview-dashboard">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" stroke="currentColor" stroke-width="1.8"/>
              <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>Total Users</h3>
            <p class="stat-number">{{ stats.totalUsers.toLocaleString() }}</p>
            <span class="stat-change" [class.positive]="usersGrowth.growth >= 0">
              {{ usersGrowth.percentage }}
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 7h18l-1 13H4L3 7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <path d="M8 7a4 4 0 0 1 8 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>Total Sellers</h3>
            <p class="stat-number">{{ stats.totalSellers.toLocaleString() }}</p>
            <span class="stat-change" [class.positive]="sellersGrowth.growth >= 0">
              {{ sellersGrowth.percentage }}
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 3v18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M16 7.5c0-1.93-1.79-3.5-4-3.5s-4 1.57-4 3.5S9.79 11 12 11s4 1.57 4 3.5S14.21 18 12 18s-4-1.57-4-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>Total Revenue</h3>
            <p class="stat-number">{{ stats.totalRevenue.toLocaleString() }}</p>
            <span class="stat-change" [class.positive]="revenueGrowth.growth >= 0">
              {{ revenueGrowth.percentage }}
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 8l-9-5-9 5 9 5 9-5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <path d="M3 8v8l9 5 9-5V8" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <path d="M12 13v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>Total Orders</h3>
            <p class="stat-number">{{ stats.totalOrders.toLocaleString() }}</p>
            <span class="stat-change" [class.positive]="ordersGrowth.growth >= 0">
              {{ ordersGrowth.percentage }}
            </span>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-container">
          <div class="chart-header">
            <h3>Revenue Overview</h3>
            <select class="period-select">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div class="chart-content">
            <div class="chart-placeholder">
              <div class="chart-bars">
                <div class="bar" 
                     *ngFor="let item of weeklyRevenue" 
                     [style.height.%]="getBarHeight(item.revenue)">
                </div>
              </div>
              <div class="chart-labels">
                <span *ngFor="let item of weeklyRevenue">{{ item.day }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-header">
            <h3>Product Categories</h3>
          </div>
          <div class="chart-content">
            <div class="category-list">
              <div class="category-item" *ngFor="let category of categoryCounts">
                <div class="category-info">
                  <span class="category-dot" [ngClass]="getCategoryColor(category.category_name)"></span>
                  <span>{{ category.category_name }}</span>
                </div>
                <span class="category-value">{{ getCategoryPercentage(category.count) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <div class="activity-card">
          <div class="activity-header">
            <h3>Recent Transactions</h3>
            <button class="view-all-btn">View All</button>
          </div>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let transaction of recentTransactions">
              <div class="activity-icon" [ngClass]="getActivityIconClass(transaction.status)">
                ✓
              </div>
              <div class="activity-content">
                <p class="activity-title">Order #{{ transaction.order_id.slice(0, 8) }}</p>
                <p class="activity-desc">{{ transaction.product_name }} - {{ transaction.customer_name }}</p>
              
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overview-dashboard {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.2s;
    }

    .stat-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b82f6;
    }

    .stat-icon svg {
      width: 22px;
      height: 22px;
      display: block;
    }

    .stat-icon.blue { background: linear-gradient(135deg, rgba(59, 130, 246, 0.14) 0%, rgba(59, 130, 246, 0.06) 100%); }
    .stat-icon.green { background: linear-gradient(135deg, rgba(59, 130, 246, 0.14) 0%, rgba(59, 130, 246, 0.06) 100%); }
    .stat-icon.purple { background: linear-gradient(135deg, rgba(59, 130, 246, 0.14) 0%, rgba(59, 130, 246, 0.06) 100%); }
    .stat-icon.orange { background: linear-gradient(135deg, rgba(59, 130, 246, 0.14) 0%, rgba(59, 130, 246, 0.06) 100%); }

    .stat-content h3 {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 500;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
    }

    .stat-change {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .stat-change.positive { color: #3b82f6; }
    .stat-change.negative { color: #ef4444; }

    .charts-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .chart-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }

    .period-select {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      font-size: 0.875rem;
      color: #64748b;
      cursor: pointer;
    }

    .chart-placeholder {
      height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      gap: 1rem;
    }

    .chart-bars {
      display: flex;
      align-items: flex-end;
      gap: 1rem;
      height: 150px;
      width: 100%;
    }

    .bar {
      flex: 1;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 4px 4px 0 0;
      min-height: 20px;
      transition: all 0.2s;
    }

    .chart-labels {
      display: flex;
      width: 100%;
      justify-content: space-around;
      font-size: 0.75rem;
      color: #64748b;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .category-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .category-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .category-dot.blue { background: #667eea; }
    .category-dot.green { background: #10b981; }
    .category-dot.purple { background: #8b5cf6; }
    .category-dot.orange { background: #f59e0b; }

    .category-value {
      font-weight: 600;
      color: #1e293b;
    }

    .activity-section {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .activity-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .activity-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }

    .view-all-btn {
      background: none;
      border: 1px solid #e2e8f0;
      color: #667eea;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-all-btn:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .activity-item:hover {
      background: #f8fafc;
    }

    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
      font-weight: bold;
    }

    .activity-icon.green { background: #10b981; }
    .activity-icon.blue { background: #3b82f6; }
    .activity-icon.orange { background: #f59e0b; }
    .activity-icon.red { background: #ef4444; }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      margin: 0 0 0.25rem 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
    }

    .activity-desc {
      margin: 0 0 0.25rem 0;
      font-size: 0.875rem;
      color: #64748b;
    }

    .activity-time {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    @media (max-width: 1024px) {
      .charts-section {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})

export class AdminOverviewComponent implements OnInit {
  stats = {
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingSellers: 0,
    totalOrders: 0
  };

  usersGrowth = { growth: 0, percentage: '0%' };
  sellersGrowth = { growth: 0, percentage: '0%' };
  revenueGrowth = { growth: 0, percentage: '0%' };
  ordersGrowth = { growth: 0, percentage: '0%' };

  weeklyRevenue: { day: string; revenue: number }[] = [];
  categoryCounts: { category_name: string; count: number }[] = [];
  recentTransactions: any[] = [];

  isLoading = true;
  totalRevenue = 0;

  constructor(
    private dashboardStatsService: DashboardStatsService,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    await this.waitForSession();
    await this.loadDashboardData();
  }

  private async waitForSession(maxWaitMs: number = 5000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const session = this.supabaseService.getCurrentSession();
      if (session?.user) return;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  async loadDashboardData() {
    try {
      this.isLoading = true;

      // Add a small delay to ensure auth context is properly set
      await new Promise(resolve => setTimeout(resolve, 100));

      const [
        statsData,
        usersGrowthData,
        sellersGrowthData,
        ordersGrowthData,
        revenueGrowthData,
        weeklyRevenueData,
        categoryCountsData,
        recentTransactionsData
      ] = await Promise.all([
        this.dashboardStatsService.getDashboardStats(),
        this.dashboardStatsService.getUsersGrowth(),
        this.dashboardStatsService.getSellersGrowth(),
        this.dashboardStatsService.getOrdersGrowth(),
        this.dashboardStatsService.getRevenueGrowth(),
        this.dashboardStatsService.getWeeklyRevenue(),
        this.dashboardStatsService.getProductCountsByCategory(),
        this.dashboardStatsService.getRecentTransactions(5)
      ]);

      this.stats = statsData;
      this.usersGrowth = usersGrowthData;
      this.sellersGrowth = sellersGrowthData;
      this.ordersGrowth = ordersGrowthData;
      this.revenueGrowth = revenueGrowthData;
      this.weeklyRevenue = weeklyRevenueData;
      this.categoryCounts = categoryCountsData;
      this.recentTransactions = recentTransactionsData;
      this.totalRevenue = statsData.totalRevenue;

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getBarHeight(revenue: number): number {
    if (this.weeklyRevenue.length === 0) return 0;
    const maxRevenue = Math.max(...this.weeklyRevenue.map(item => item.revenue));
    return maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
  }

  getCategoryPercentage(count: number): string {
    const total = (this.categoryCounts || []).reduce((sum, c) => sum + (c.count || 0), 0);
    if (total === 0) return '0';
    return ((count / total) * 100).toFixed(1);
  }

  getCategoryColor(categoryName: string): string {
    const colors: { [key: string]: string } = {
      'Electronics': 'blue',
      'Clothing': 'green',
      'Food': 'purple',
      'Other': 'orange'
    };
    return colors[categoryName] || 'orange';
  }

  getActivityIconClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'completed': 'green',
      'pending': 'blue',
      'processing': 'orange',
      'cancelled': 'red'
    };
    return statusMap[status] || 'blue';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }
}
