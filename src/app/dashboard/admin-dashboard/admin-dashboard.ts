import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoggedInUser } from '../../services/auth.service';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { AdminStatCardComponent } from './components/stat-card/stat-card.component';
import { ProductPerformanceComponent } from './components/product-performance-chart/product-performance-chart.component';
import { SellerRequestsComponent } from './components/seller-requests/seller-requests.component';
import { RecentTransactionsComponent } from './components/recent-transactions/recent-transactions.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    AdminStatCardComponent,
    ProductPerformanceComponent,
    SellerRequestsComponent,
    RecentTransactionsComponent
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  standalone: true
})
export class AdminDashboardComponent implements OnInit {
  user: LoggedInUser | null = null;
  today = new Date();
  
  totalUsers: number | null = null;
  totalSellers: number | null = null;
  totalRevenue: number | null = null;
  
  isLoading = true;

  constructor(
    private authService: AuthService,
    private adminService: AdminDashboardService,
    private router: Router
  ) {
    this.user = this.authService.getUser();
  }

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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
