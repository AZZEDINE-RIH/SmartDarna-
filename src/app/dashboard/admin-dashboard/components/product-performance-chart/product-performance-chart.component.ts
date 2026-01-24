import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService, CategoryRevenue } from '../../../../services/admin-dashboard.service';

@Component({
  selector: 'app-product-performance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h2>Product Performance</h2>
        <select (change)="onFilterChange($event)">
          <option value="30">Last 30 Days</option>
        </select>
      </div>
      
      <div class="chart-container" *ngIf="!isLoading && data.length > 0">
        <div *ngFor="let item of data" class="bar-group">
          <div class="bar-label">{{ item.category }}</div>
          <div class="bar-wrapper">
            <div class="bar" [style.width.%]="(item.revenue / maxRevenue) * 100"></div>
          </div>
          <div class="bar-value">\${{ item.revenue | number }}</div>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading">Loading...</div>
      <div *ngIf="!isLoading && data.length === 0" class="empty-state">
        <p>Data coming soon</p>
      </div>
    </div>
  `,
  styles: [`
    .card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .card-header h2 { margin: 0; font-size: 1.125rem; }
    .bar-group { display: flex; align-items: center; margin-bottom: 1rem; gap: 1rem; }
    .bar-label { width: 100px; font-size: 0.875rem; color: #666; }
    .bar-wrapper { flex: 1; background: #f5f5f5; height: 12px; border-radius: 6px; overflow: hidden; }
    .bar { height: 100%; background: #3b82f6; border-radius: 6px; transition: width 0.5s ease; }
    .bar-value { width: 80px; text-align: right; font-size: 0.875rem; font-weight: 500; }
    .empty-state { text-align: center; padding: 2rem; color: #999; font-style: italic; }
  `]
})
export class ProductPerformanceComponent implements OnInit {
  data: CategoryRevenue[] = [];
  isLoading = true;
  maxRevenue = 0;

  constructor(private adminService: AdminDashboardService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.adminService.getProductPerformance().subscribe(data => {
      this.data = data;
      this.maxRevenue = Math.max(...data.map(d => d.revenue), 1);
      this.isLoading = false;
    });
  }

  onFilterChange(event: any) {
    // Implement filter logic if service supports parameters
    this.loadData();
  }
}
