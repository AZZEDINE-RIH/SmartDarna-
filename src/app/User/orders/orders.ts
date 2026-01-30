import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Info } from './info/info';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ThemeService } from '../../theme.service';
import { Subscription } from 'rxjs';

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: string[];
  totalAmount: number;
  status: 'pending' | 'shipped' | 'delivered';
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

  activeTab: 'all' | 'pending' | 'shipped' | 'delivered' = 'all';
  showDetails = false;
  selectedOrder: Order | null = null;
  isDarkMode: boolean = false;
  private themeSubscription?: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
  }

  orders: Order[] = [
  {
    id: 1,
    orderNumber: 'ORD-1001',
    customerName: 'Ahmed Benali',
    customerEmail: 'ahmed.benali@gmail.com',
    items: [
      'Amazon Echo Dot (Deep Sea Blue)',
      'Google Nest Mini (2nd gen)'
    ],
    totalAmount: 2500,
    status: 'pending',
    date: '2026-01-28',
    time: '10:45 AM',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    relativeTime: '2 hours ago',
    isRead: false,
    isArchived: false
  },

  {
    id: 2,
    orderNumber: 'ORD-1002',
    customerName: 'Sara El Amrani',
    customerEmail: 'sara.elamrani@gmail.com',
    items: [
      'Apple HomePod Mini (Blue)'
    ],
    totalAmount: 1500,
    status: 'shipped',
    date: '2026-01-26',
    time: '02:30 PM',
    avatarUrl: 'https://i.pravatar.cc/150?img=32',
    relativeTime: '1 day ago',
    isRead: true,
    isArchived: false
  },

  {
    id: 3,
    orderNumber: 'ORD-1003',
    customerName: 'Youssef Rahmani',
    customerEmail: 'y.rahmani@gmail.com',
    items: [
      'Google Nest Hub Max'
    ],
    totalAmount: 3000,
    status: 'delivered',
    date: '2026-01-22',
    time: '09:10 AM',
    avatarUrl: 'https://i.pravatar.cc/150?img=15',
    relativeTime: '5 days ago',
    isRead: true,
    isArchived: false
  },

  {
    id: 4,
    orderNumber: 'ORD-1004',
    customerName: 'Imane Zahraoui',
    customerEmail: 'imane.z@gmail.com',
    items: [
      'Ecobee Smart Thermostat Premium',
      'Google Nest Thermostat'
    ],
    totalAmount: 5000,
    status: 'pending',
    date: '2026-01-29',
    time: '06:20 PM',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    relativeTime: '30 minutes ago',
    isRead: false,
    isArchived: false
  },

  {
    id: 5,
    orderNumber: 'ORD-1005',
    customerName: 'Omar Haddad',
    customerEmail: 'omar.haddad@gmail.com',
    items: [
      'Nest Doorbell (battery)',
      'Arlo Video Doorbell'
    ],
    totalAmount: 3000,
    status: 'shipped',
    date: '2026-01-25',
    time: '11:55 AM',
    avatarUrl: 'https://i.pravatar.cc/150?img=8',
    relativeTime: '2 days ago',
    isRead: true,
    isArchived: false
  },

  {
    id: 6,
    orderNumber: 'ORD-1006',
    customerName: 'Khadija Mansouri',
    customerEmail: 'khadija.m@gmail.com',
    items: [
      'Amazon Echo Dot Kids (Dragon)'
    ],
    totalAmount: 1099,
    status: 'delivered',
    date: '2026-01-20',
    time: '04:40 PM',
    avatarUrl: 'https://i.pravatar.cc/150?img=28',
    relativeTime: '1 week ago',
    isRead: true,
    isArchived: false
  },

  {
    id: 7,
    orderNumber: 'ORD-1007',
    customerName: 'Mehdi Ait Lahcen',
    customerEmail: 'mehdi.ait@gmail.com',
    items: [
      'Yale Assure Lock 2',
      'Google Home Speaker'
    ],
    totalAmount: 4550,
    status: 'pending',
    date: '2026-01-30',
    time: '09:05 AM',
    avatarUrl: 'https://i.pravatar.cc/150?img=19',
    relativeTime: 'just now',
    isRead: false,
    isArchived: false
  }
];

    

  // ✅ MAIN FILTER
  get filteredOrders(): Order[] {
    switch (this.activeTab) {
      case 'pending':
        return this.orders.filter(o => o.status === 'pending' && !o.isArchived);

      case 'shipped':
        return this.orders.filter(o => o.status === 'shipped' && !o.isArchived);

      case 'delivered':
        return this.orders.filter(o => o.status === 'delivered' && !o.isArchived);

      default:
        return this.orders.filter(o => !o.isArchived);
    }
  }

  setActiveTab(tab: 'all' | 'pending' | 'shipped' | 'delivered'): void {
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

  getShippedCount(): number {
    return this.orders.filter(o => o.status === 'shipped' && !o.isArchived).length;
  }

  getDeliveredCount(): number {
    return this.orders.filter(o => o.status === 'delivered' && !o.isArchived).length;
  }

  getTotalCount(): number {
    return this.filteredOrders.length;
  }
}
