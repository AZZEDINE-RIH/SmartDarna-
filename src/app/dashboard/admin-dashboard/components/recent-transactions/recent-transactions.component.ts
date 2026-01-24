import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService, Transaction } from '../../../../services/admin-dashboard.service';

@Component({
  selector: 'app-recent-transactions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h2>Recent Transactions</h2>
      <div class="table-responsive" *ngIf="!isLoading && transactions.length > 0">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Product</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tx of transactions">
              <td>{{ tx.customerName }}</td>
              <td>{{ tx.productName }}</td>
              <td>{{ tx.date | date:'shortDate' }}</td>
              <td>\${{ tx.amount | number }}</td>
              <td>
                <span class="status-badge" [ngClass]="tx.status.toLowerCase()">
                  {{ tx.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="isLoading" class="loading">Loading...</div>
      <div *ngIf="!isLoading && transactions.length === 0" class="empty-state">
        <p>No recent transactions</p>
      </div>
    </div>
  `,
  styles: [`
    .card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    h2 { margin: 0 0 1.5rem; font-size: 1.125rem; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 0.75rem 0; color: #666; font-size: 0.875rem; font-weight: 500; border-bottom: 1px solid #eee; }
    td { padding: 1rem 0; font-size: 0.875rem; border-bottom: 1px solid #f5f5f5; }
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
    .status-badge.completed, .status-badge.paid { background: #dcfce7; color: #166534; }
    .status-badge.pending { background: #fff7ed; color: #c2410c; }
    .status-badge.cancelled { background: #fee2e2; color: #991b1b; }
  `]
})
export class RecentTransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  isLoading = true;

  constructor(private adminService: AdminDashboardService) {}

  ngOnInit() {
    this.isLoading = true;
    this.adminService.getRecentTransactions().subscribe(data => {
      this.transactions = data;
      this.isLoading = false;
    });
  }
}
