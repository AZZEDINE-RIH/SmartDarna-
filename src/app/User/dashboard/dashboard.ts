import { Component, AfterViewInit, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { ThemeService } from '../../theme.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SellerDashboardService, SellerStats, TopProduct, RecentOrder } from '../../services/seller-dashboard.service';
import { SupabaseService } from '../../services/supabase.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [HttpClientModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {

  stats: SellerStats | null = null;
  revenueData: { labels: string[], data: number[] } | null = null;
  topProducts: TopProduct[] = [];
  recentOrders: RecentOrder[] = [];
  isLoading: boolean = true;


  isDarkMode: boolean = false;
  private themeSubscription?: Subscription;
  private chart: Chart | null = null;

  constructor(
    private themeService: ThemeService,
    private sellerService: SellerDashboardService,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
      this.updateChartTheme();
    });

    this.loadDashboardData();
  }



  async loadDashboardData() {
    this.isLoading = true;
    try {
      const { data: { user } } = await this.supabaseService.getClient().auth.getUser();

      if (user) {
        console.log('📊 Dashboard: Loading data for user ID:', user.id);

        // Fetch specific stats
        this.sellerService.getSellerStats(user.id).subscribe(stats => {
          console.log('📈 Dashboard: Received stats:', stats);
          this.stats = stats;
          this.cdr.detectChanges();
        });

        this.sellerService.getMonthlyRevenue(user.id).subscribe(data => {
          console.log('💰 Dashboard: Received revenue data:', data);
          this.revenueData = data;
          this.initChart(); // Re-init chart when data is available
          this.cdr.detectChanges();
        });

        this.sellerService.getTopProducts(user.id).subscribe(products => {
          console.log('🏆 Dashboard: Received top products:', products);
          this.topProducts = products;
          this.cdr.detectChanges();
        });

        this.sellerService.getRecentOrders(user.id).subscribe(orders => {
          console.log('📦 Dashboard: Received recent orders:', orders);
          this.recentOrders = orders;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      } else {
        console.warn('No authenticated user found');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    } catch (err) {
      console.error('Error loading dashboard data', err);
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
    this.chart?.destroy();
  }

  ngAfterViewInit(): void {
    // Chart init is handled in loadDashboardData after data fetch
  }

  private initChart() {
    if (!this.revenueData) return;

    const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if any
    if (this.chart) {
      this.chart.destroy();
    }

    // Gradient for the chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(96, 206, 214, 0.3)');
    gradient.addColorStop(1, 'rgba(96, 206, 214, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.revenueData.labels,
        datasets: [{
          data: this.revenueData.data,
          borderColor: '#60CED6',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#60CED6',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 0 },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1f2937',
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: function (context: any) {
                return (context.parsed?.y ?? 0).toLocaleString() + ' MAD';
              }
            }
          }
        },
        scales: {
          y: {
            display: false,
            beginAtZero: true,
            grid: { drawTicks: false, color: 'rgba(0, 0, 0, 0.05)' },
            border: { display: false }
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: this.isDarkMode ? '#9ca3af' : '#9ca3af', font: { size: 12 } }
          }
        },
        interaction: { intersect: false, mode: 'index' }
      }
    });
  }

  private updateChartTheme() {
    if (this.chart) {
      // Update chart colors based on theme if needed
      // Currently colors are fixed, but could be dynamic
      this.chart.update();
    }
  }
}

