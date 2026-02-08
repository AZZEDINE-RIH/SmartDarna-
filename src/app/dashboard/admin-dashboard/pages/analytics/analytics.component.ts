import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStats, DashboardStatsService, CategoryCount, CategoryRevenue } from '../../../../services/dashboard-stats.service';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-page">
      <div class="page-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p class="subtitle">View detailed analytics and reports</p>
        </div>

        <div class="header-actions">
          <button class="btn" type="button" (click)="refresh()" [disabled]="isLoading">
            Refresh
          </button>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-state">
        Loading analytics...
      </div>

      <div *ngIf="!isLoading" class="content">
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-title">Total Revenue</div>
            <div class="kpi-value">{{ formatCurrency(stats.totalRevenue) }}</div>
            <div class="kpi-foot" [class.positive]="revenueGrowth.growth >= 0">{{ revenueGrowth.percentage }}</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-title">Total Orders</div>
            <div class="kpi-value">{{ stats.totalOrders.toLocaleString() }}</div>
            <div class="kpi-foot" [class.positive]="ordersGrowth.growth >= 0">{{ ordersGrowth.percentage }}</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-title">Total Users</div>
            <div class="kpi-value">{{ stats.totalUsers.toLocaleString() }}</div>
            <div class="kpi-foot" [class.positive]="usersGrowth.growth >= 0">{{ usersGrowth.percentage }}</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-title">Total Sellers</div>
            <div class="kpi-value">{{ stats.totalSellers.toLocaleString() }}</div>
            <div class="kpi-foot" [class.positive]="sellersGrowth.growth >= 0">{{ sellersGrowth.percentage }}</div>
          </div>
        </div>

        <div class="charts-grid">
          <div class="card">
            <div class="card-header">
              <h3>Weekly Revenue</h3>
              <span class="card-sub">Last 7 days</span>
            </div>

            <div class="chart-area" *ngIf="weeklyRevenue.length > 0; else noWeekly">
              <div class="bars">
                <div
                  class="bar"
                  *ngFor="let item of weeklyRevenue"
                  [style.height.%]="getWeeklyBarHeight(item.revenue)"
                  [title]="item.day + ': ' + formatCurrency(item.revenue)"
                ></div>
              </div>
              <div class="labels">
                <span *ngFor="let item of weeklyRevenue">{{ item.day }}</span>
              </div>
            </div>

            <ng-template #noWeekly>
              <div class="empty">No data</div>
            </ng-template>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>Revenue by Category</h3>
              <span class="card-sub">Completed/Delivered</span>
            </div>

            <div *ngIf="revenueByCategory.length === 0" class="empty">No data</div>
            <div *ngIf="revenueByCategory.length > 0" class="hbars">
              <div class="hbar" *ngFor="let c of revenueByCategory">
                <div class="hbar-top">
                  <span class="hbar-label">{{ c.category_name }}</span>
                  <span class="hbar-value">{{ formatCurrency(c.revenue) }}</span>
                </div>
                <div class="hbar-track">
                  <div class="hbar-fill" [style.width.%]="getRevenueBarWidth(c.revenue)"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>Product Mix</h3>
              <span class="card-sub">Products by category</span>
            </div>

            <div *ngIf="categoryCounts.length === 0" class="empty">No data</div>
            <div *ngIf="categoryCounts.length > 0" class="mix">
              <div class="mix-row" *ngFor="let cat of categoryCounts">
                <div class="mix-left">
                  <span class="dot"></span>
                  <span class="mix-name">{{ cat.category_name }}</span>
                </div>
                <div class="mix-right">
                  <span class="mix-pct">{{ getCategoryPercentage(cat.count) }}%</span>
                  <span class="mix-count">({{ cat.count }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text);
    }

    .subtitle {
      margin: 0.25rem 0 0 0;
      color: var(--muted);
      font-size: 0.9rem;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .btn {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.6rem 0.9rem;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.85rem;
      transition: all 0.2s ease;
    }

    .btn:hover:enabled {
      background: var(--surface-2);
      border-color: var(--border-2);
      transform: translateY(-1px);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-state {
      padding: 1.25rem;
      border: 1px dashed var(--border);
      border-radius: 12px;
      background: var(--surface);
      color: var(--muted);
      font-weight: 600;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .kpi-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.1rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .kpi-title {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-weight: 700;
      color: var(--muted);
    }

    .kpi-value {
      font-size: 1.6rem;
      font-weight: 900;
      color: var(--text);
      line-height: 1.1;
    }

    .kpi-foot {
      font-weight: 800;
      color: var(--danger);
      font-size: 0.85rem;
    }

    .kpi-foot.positive {
      color: var(--accent);
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1rem;
      margin-top: 1rem;
    }

    .card {
      grid-column: span 6;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.1rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      min-height: 280px;
    }

    .card:nth-child(3) {
      grid-column: span 12;
      min-height: auto;
    }

    .card-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 900;
      color: var(--text);
    }

    .card-sub {
      color: var(--muted);
      font-size: 0.85rem;
      font-weight: 700;
    }

    .empty {
      padding: 1rem;
      color: var(--muted);
      font-weight: 700;
    }

    .chart-area {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      height: 210px;
      justify-content: flex-end;
    }

    .bars {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 10px;
      height: 170px;
      align-items: end;
      background: linear-gradient(180deg, rgba(20, 184, 166, 0.08) 0%, rgba(20, 184, 166, 0.0) 100%);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
    }

    .bar {
      width: 100%;
      border-radius: 10px;
      background: linear-gradient(180deg, var(--accent) 0%, rgba(20, 184, 166, 0.35) 100%);
      min-height: 6px;
      transition: height 0.3s ease;
    }

    .labels {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 10px;
      color: var(--muted);
      font-weight: 700;
      font-size: 0.8rem;
      padding: 0 8px;
    }

    .labels span {
      text-align: center;
    }

    .hbars {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      margin-top: 0.3rem;
    }

    .hbar {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .hbar-top {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      font-weight: 800;
    }

    .hbar-label {
      color: var(--text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 70%;
    }

    .hbar-value {
      color: var(--muted);
      font-weight: 800;
    }

    .hbar-track {
      height: 12px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 999px;
      overflow: hidden;
    }

    .hbar-fill {
      height: 100%;
      background: linear-gradient(90deg, rgba(20, 184, 166, 0.35) 0%, var(--accent) 100%);
      border-radius: 999px;
      transition: width 0.35s ease;
    }

    .mix {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
      margin-top: 0.25rem;
    }

    .mix-row {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.55rem 0.6rem;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--surface-2);
    }

    .mix-left {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      min-width: 0;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: var(--accent);
      flex-shrink: 0;
    }

    .mix-name {
      color: var(--text);
      font-weight: 900;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .mix-right {
      display: flex;
      gap: 0.5rem;
      align-items: baseline;
      flex-shrink: 0;
    }

    .mix-pct {
      font-weight: 900;
      color: var(--text);
    }

    .mix-count {
      font-weight: 800;
      color: var(--muted);
    }

    @media (max-width: 1024px) {
      .card {
        grid-column: span 12;
      }
    }
  `]
})
export class AnalyticsPageComponent implements OnInit {
  isLoading = true;

  stats: DashboardStats = {
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
  revenueByCategory: CategoryRevenue[] = [];
  categoryCounts: CategoryCount[] = [];

  private maxWeeklyRevenue = 1;
  private maxCategoryRevenue = 1;

  constructor(
    private dashboardStatsService: DashboardStatsService,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.waitForSession();
    await this.loadAnalytics();
    this.cdr.detectChanges();
  }

  async refresh(): Promise<void> {
    await this.loadAnalytics();
  }

  private async waitForSession(maxWaitMs: number = 5000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const session = this.supabaseService.getCurrentSession();
      if (session?.user) return;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  private async loadAnalytics(): Promise<void> {
    try {
      this.isLoading = true;
      this.cdr.detectChanges();

      await new Promise(resolve => setTimeout(resolve, 100));

      const [
        statsData,
        usersGrowthData,
        sellersGrowthData,
        ordersGrowthData,
        revenueGrowthData,
        weeklyRevenueData,
        revenueByCategoryData,
        categoryCountsData
      ] = await Promise.all([
        this.dashboardStatsService.getDashboardStats(),
        this.dashboardStatsService.getUsersGrowth(),
        this.dashboardStatsService.getSellersGrowth(),
        this.dashboardStatsService.getOrdersGrowth(),
        this.dashboardStatsService.getRevenueGrowth(),
        this.dashboardStatsService.getWeeklyRevenue(),
        this.dashboardStatsService.getRevenueByCategory(),
        this.dashboardStatsService.getProductCountsByCategory()
      ]);

      this.stats = statsData;
      this.usersGrowth = usersGrowthData;
      this.sellersGrowth = sellersGrowthData;
      this.ordersGrowth = ordersGrowthData;
      this.revenueGrowth = revenueGrowthData;

      this.weeklyRevenue = weeklyRevenueData || [];
      this.maxWeeklyRevenue = Math.max(...(this.weeklyRevenue || []).map(x => x.revenue || 0), 1);

      const sortedRevenueByCategory = (revenueByCategoryData || [])
        .slice()
        .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
        .slice(0, 8);
      this.revenueByCategory = sortedRevenueByCategory;
      this.maxCategoryRevenue = Math.max(...sortedRevenueByCategory.map(x => x.revenue || 0), 1);

      this.categoryCounts = (categoryCountsData || []).slice(0, 12);

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  getWeeklyBarHeight(revenue: number): number {
    const max = this.maxWeeklyRevenue || 1;
    return max > 0 ? ((revenue || 0) / max) * 100 : 0;
  }

  getRevenueBarWidth(revenue: number): number {
    const max = this.maxCategoryRevenue || 1;
    return max > 0 ? ((revenue || 0) / max) * 100 : 0;
  }

  getCategoryPercentage(count: number): string {
    const total = (this.categoryCounts || []).reduce((sum, c) => sum + (c.count || 0), 0);
    if (total === 0) return '0';
    return (((count || 0) / total) * 100).toFixed(1);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(amount || 0));
  }
}
