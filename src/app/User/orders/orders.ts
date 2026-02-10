import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Info } from './info/info';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ThemeService } from '../../theme.service';
import { Subscription } from 'rxjs';
import { SellerDashboardService } from '../../services/seller-dashboard.service';
import { SupabaseService } from '../../services/supabase.service';
import { ChangeDetectorRef } from '@angular/core';

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: string[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
  time: string;
  avatarUrl: string;
  relativeTime: string;
  isRead: boolean;
  isArchived: boolean;
}

@Component({
  selector: 'app-orders',
  imports: [CommonModule, Info],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit, OnDestroy {

  activeTab: 'all' | 'pending' | 'processing' | 'completed' | 'cancelled' = 'all';
  showDetails = false;
  selectedOrder: Order | null = null;
  isDarkMode: boolean = false;
  private themeSubscription?: Subscription;

  isLoading = true;

  constructor(
    private themeService: ThemeService,
    private sellerService: SellerDashboardService,
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });

    await this.loadOrders();
  }

  async loadOrders() {
    try {
      console.log('📦 Orders: Loading...');
      const { data: { user } } = await this.supabase.getClient().auth.getUser();
      if (user) {
        console.log('📦 Orders: User ID:', user.id);
        this.sellerService.getAllSellerOrders(user.id).subscribe(orders => {
          console.log('📦 Orders: Received:', orders);
          if (orders.length === 0) {
            console.warn('📦 Orders: No orders found for this seller.');
          }
          this.orders = orders.map(o => ({
            ...o,
            relativeTime: this.formatRelativeTime(o.relativeTime)
          }));
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      } else {
        console.warn('📦 Orders: No authenticated user.');
      }
    } catch (e) {
      console.error('Error loading orders:', e);
      this.isLoading = false;
    }
  }

  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
  }

  orders: Order[] = [];



  // ✅ MAIN FILTER
  get filteredOrders(): Order[] {
    switch (this.activeTab) {
      case 'pending':
        return this.orders.filter(o => o.status === 'pending' && !o.isArchived);

      case 'processing':
        return this.orders.filter(o => o.status === 'processing' && !o.isArchived);

      case 'completed':
        return this.orders.filter(o => o.status === 'completed' && !o.isArchived);

      case 'cancelled':
        return this.orders.filter(o => o.status === 'cancelled' && !o.isArchived);

      default:
        return this.orders.filter(o => !o.isArchived);
    }
  }

  setActiveTab(tab: 'all' | 'pending' | 'processing' | 'completed' | 'cancelled'): void {
    this.activeTab = tab;
  }

  onOrderClick(order: Order): void {
    order.isRead = true;
    this.selectedOrder = order;
    this.showDetails = true;
  }

  archiveOrder(order: Order): void {
    order.isArchived = true;
  }

  onBackToList(): void {
    this.showDetails = false;
    this.selectedOrder = null;
  }

  getPendingCount(): number {
    return this.orders.filter(o => o.status === 'pending' && !o.isArchived).length;
  }

  getProcessingCount(): number {
    return this.orders.filter(o => o.status === 'processing' && !o.isArchived).length;
  }

  getCompletedCount(): number {
    return this.orders.filter(o => o.status === 'completed' && !o.isArchived).length;
  }

  getCancelledCount(): number {
    return this.orders.filter(o => o.status === 'cancelled' && !o.isArchived).length;
  }

  getTotalCount(): number {
    return this.filteredOrders.length;
  }
}
