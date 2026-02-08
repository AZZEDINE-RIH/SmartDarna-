import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { OrderService, Order } from '../../../../services/order.service';

@Component({
  selector: 'app-recent-transactions',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  providers: [OrderService],
  template: `
    <div class="recent-transactions-container">
      <div class="header">
        <h2>Recent Transactions</h2>
        <button class="download-btn">Download Report</button>
      </div>

      <div *ngIf="isLoading" class="loading-state">
        <p>Loading transactions...</p>
      </div>

      <div *ngIf="!isLoading && orders.length === 0" class="no-data">
        <p>Data coming soon</p>
      </div>

      <div *ngIf="!isLoading && orders.length > 0" class="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders">
              <td class="order-id">{{ order.id | slice:0:8 }}...</td>
              <td>{{ order.customer_name }}</td>
              <td class="amount">{{ order.total_amount | currency }}</td>
              <td>
                <span class="status-badge" [class]="'status-' + order.status.toLowerCase()">
                  {{ order.status | uppercase }}
                </span>
              </td>
              <td class="date">{{ formatDate(order.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .recent-transactions-container {
      background: white;
      border-radius: 8px;
      padding: 25px;
      border: 1px solid #e8e8e8;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }

    .header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .download-btn {
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      color: #333;
      transition: all 0.3s ease;
    }

    .download-btn:hover {
      background: #e8e8e8;
      border-color: #d0d0d0;
    }

    .loading-state,
    .no-data {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .transactions-table {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    thead {
      background: #f9f9f9;
      border-bottom: 2px solid #e8e8e8;
    }

    th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }

    tbody tr {
      border-bottom: 1px solid #e8e8e8;
      transition: background 0.3s ease;
    }

    tbody tr:hover {
      background: #f9f9f9;
    }

    td {
      padding: 15px;
      color: #333;
    }

    .order-id {
      font-family: 'Courier New', monospace;
      color: #666;
      font-weight: 600;
    }

    .amount {
      font-weight: 600;
      color: #2dce89;
    }

    .date {
      color: #999;
      font-size: 12px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-pending {
      background: rgba(255, 165, 0, 0.1);
      color: #ff6b3d;
    }

    .status-confirmed {
      background: rgba(0, 212, 255, 0.1);
      color: #00d4ff;
    }

    .status-shipped {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .status-delivered {
      background: rgba(45, 206, 137, 0.1);
      color: #2dce89;
    }

    .status-cancelled {
      background: rgba(255, 107, 107, 0.1);
      color: #ff6b6b;
    }

    @media (max-width: 768px) {
      .recent-transactions-container {
        padding: 15px;
      }

      table {
        font-size: 12px;
      }

      th, td {
        padding: 10px;
      }
    }
  `]
})
export class RecentTransactionsComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadRecentOrders();
  }

  loadRecentOrders() {
    this.isLoading = true;
    this.orderService.getRecentOrders(10).subscribe({
      next: (data: Order[]) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading orders:', err);
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
