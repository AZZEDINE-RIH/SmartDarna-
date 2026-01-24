import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AdminDashboardService } from '../../../../services/admin-dashboard.service';
import { AdminStatCardComponent } from '../../components/stat-card/stat-card.component';
import { ProductPerformanceComponent } from '../../components/product-performance-chart/product-performance-chart.component';
import { SellerRequestsComponent } from '../../components/seller-requests/seller-requests.component';
import { RecentTransactionsComponent } from '../../components/recent-transactions/recent-transactions.component';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [
    CommonModule,
    AdminStatCardComponent,
    ProductPerformanceComponent,
    SellerRequestsComponent,
    RecentTransactionsComponent
  ],
  template: `
    <header class="top-bar">
      <h1>Dashboard Overview</h1>
      <div class="date">{{ today | date:'fullDate' }}</div>
    </header>

    <div class="dashboard-grid">
      <!-- KPIs -->
      <div class="kpi-section">
        <app-admin-stat-card
          title="Total Users"
          [value]="totalUsers"
          icon="icon-users"
          iconClass="blue"
          [loading]="isLoading">
        </app-admin-stat-card>
        
        <app-admin-stat-card
          title="Total Sellers"
          [value]="totalSellers"
          icon="icon-sellers"
          iconClass="green"
          [loading]="isLoading">
        </app-admin-stat-card>
        
        <app-admin-stat-card
          title="Total Revenue"
          [value]="totalRevenue"
          icon="icon-revenue"
          iconClass="purple"
          [loading]="isLoading">
        </app-admin-stat-card>
      </div>

      <!-- Charts & Requests -->
      <div class="mid-section">
        <div class="chart-area">
          <app-product-performance></app-product-performance>
        </div>
        <div class="requests-area">
          <app-seller-requests></app-seller-requests>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="bottom-section">
        <app-recent-transactions></app-recent-transactions>
      </div>
    </div>
  `,
  styles: [`
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .top-bar h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #0f172a;
    }

    .date {
      color: #64748b;
    }

    .dashboard-grid {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .kpi-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }

    .mid-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 1024px) {
      .mid-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminOverviewComponent implements OnInit {
  today = new Date();
  totalUsers: number | null = null;
  totalSellers: number | null = null;
  totalRevenue: number | null = null;
  isLoading = true;

  constructor(private adminService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    forkJoin({
      users: this.adminService.getTotalUsers(),
      sellers: this.adminService.getTotalSellers(),
      revenue: this.adminService.getTotalRevenue()
    }).subscribe({
      next: (data) => {
        this.totalUsers = data.users;
        this.totalSellers = data.sellers;
        this.totalRevenue = data.revenue;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading KPIs:', err);
        this.isLoading = false;
      }
    });
  }
}
