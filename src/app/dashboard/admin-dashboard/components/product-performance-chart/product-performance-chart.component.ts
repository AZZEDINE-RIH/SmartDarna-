import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService, CategoryRevenue } from '../../../../services/admin-dashboard.service';

@Component({
  selector: 'app-product-performance-chart',
  standalone: true,
  imports: [CommonModule],
  providers: [AdminDashboardService],
  template: `
    <div class="chart-container">
      <h2>Product Performance by Category</h2>
      <p class="chart-subtitle">Revenue by category (Last 30 days)</p>
      
      <div *ngIf="isLoading" class="loading-state">
        <p>Loading chart data...</p>
      </div>

      <div *ngIf="!isLoading && chartData.length === 0" class="no-data">
        <p>Data coming soon</p>
      </div>

      <div *ngIf="!isLoading && chartData.length > 0" class="chart-wrapper">
        <div class="chart-bars">
          <div *ngFor="let item of chartData" class="bar-item">
            <div class="bar-label">{{ item.category_name }}</div>
            <div class="bar-container">
              <div 
                class="bar-fill" 
                [style.width.%]="getBarWidth(item.revenue)"
                [style.background]="getBarColor(item.category_name)">
                <span class="bar-value">{{ formatCurrency(item.revenue) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      background: rgba(0, 212, 255, 0.05);
      padding: 25px;
      border-radius: 12px;
      border: 2px solid #00d4ff;
      box-shadow: 0 0 30px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 212, 255, 0.05);
      backdrop-filter: blur(10px);
    }

    .chart-container h2 {
      color: #00d4ff;
      font-size: 20px;
      margin: 0 0 5px 0;
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
    }

    .chart-subtitle {
      color: #a0a0a0;
      font-size: 12px;
      margin: 0 0 20px 0;
    }

    .loading-state, .no-data {
      text-align: center;
      padding: 40px 20px;
      color: #a0a0a0;
      font-style: italic;
    }

    .chart-wrapper {
      margin-top: 20px;
    }

    .chart-bars {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .bar-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bar-label {
      color: #ffffff;
      font-size: 14px;
      font-weight: 500;
      min-width: 150px;
    }

    .bar-container {
      flex: 1;
      height: 40px;
      background: rgba(0, 212, 255, 0.1);
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      border: 1px solid rgba(0, 212, 255, 0.2);
    }

    .bar-fill {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 15px;
      transition: width 0.5s ease;
      border-radius: 8px;
    }

    .bar-value {
      color: #ffffff;
      font-size: 12px;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }
  `]
})
export class ProductPerformanceChartComponent implements OnInit {
  chartData: CategoryRevenue[] = [];
  isLoading = true;
  maxRevenue = 0;

  constructor(private adminService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadChartData();
  }

  loadChartData(): void {
    this.isLoading = true;
    this.adminService.getProductPerformanceByCategory().subscribe({
      next: (data: CategoryRevenue[]) => {
        this.chartData = data;
        this.maxRevenue = Math.max(...data.map((d: CategoryRevenue) => d.revenue), 1);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading chart data:', err);
        this.chartData = [];
        this.isLoading = false;
      }
    });
  }

  getBarWidth(revenue: number): number {
    if (this.maxRevenue === 0) return 0;
    return (revenue / this.maxRevenue) * 100;
  }

  getBarColor(categoryName: string): string {
    const colors = [
      'linear-gradient(135deg, #00d4ff, #0099cc)',
      'linear-gradient(135deg, #4caf50, #2e7d32)',
      'linear-gradient(135deg, #ff9800, #f57c00)',
      'linear-gradient(135deg, #9c27b0, #7b1fa2)',
      'linear-gradient(135deg, #f44336, #d32f2f)'
    ];
    const index = categoryName.length % colors.length;
    return colors[index];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount);
  }
}
