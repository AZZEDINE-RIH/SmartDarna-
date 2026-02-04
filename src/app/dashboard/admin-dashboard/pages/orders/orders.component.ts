import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order, OrderService } from '../../../../services/order.service';
import { Seller, SellerService } from '../../../../services/seller.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `

    <div class="page-container">

      <div class="page-header">

        <h1>Orders Management</h1>

        <p>View, filter, and update order statuses</p>

        <div class="new-badge" *ngIf="newOrdersCount > 0">
          {{ newOrdersCount }} new
        </div>

      </div>



      <div class="stats-grid">

        <div class="stat-card">

          <div class="stat-icon blue">🧾</div>

          <div class="stat-content">

            <h3>Total Orders</h3>

            <p class="stat-number">{{ orders.length }}</p>

          </div>

        </div>

        <div class="stat-card">

          <div class="stat-icon purple">📅</div>

          <div class="stat-content">

            <h3>Orders Today</h3>

            <p class="stat-number">{{ getOrdersTodayCount() }}</p>

          </div>

        </div>

        <div class="stat-card">

          <div class="stat-icon orange">⏳</div>

          <div class="stat-content">

            <h3>Pending</h3>

            <p class="stat-number">{{ getCount('pending') }}</p>

          </div>

        </div>

        <div class="stat-card">

          <div class="stat-icon green">✅</div>

          <div class="stat-content">

            <h3>Completed</h3>

            <p class="stat-number">{{ getCount('completed') }}</p>

          </div>

        </div>

        <div class="stat-card">

          <div class="stat-icon red">❌</div>

          <div class="stat-content">

            <h3>Cancelled</h3>

            <p class="stat-number">{{ getCount('cancelled') }}</p>

          </div>

        </div>

        <div class="stat-card">

          <div class="stat-icon teal">💰</div>

          <div class="stat-content">

            <h3>Revenue</h3>

            <p class="stat-number">{{ getRevenue() | currency:'MAD':'symbol':'1.0-0' }}</p>

          </div>

        </div>

      </div>



      <div class="content-card">

        <div class="card-header">

          <h3>Order List</h3>

          <div class="header-actions">

            <select class="input" [(ngModel)]="statusFilter" (change)="applyFilters()">

              <option value="all">All statuses</option>

              <option *ngFor="let s of statusOptions" [value]="s">{{ s }}</option>

            </select>

            <select class="input" [(ngModel)]="sellerFilter" (change)="applyFilters()">
              <option value="all">All sellers</option>
              <option *ngFor="let s of sellers" [value]="s.user_id">{{ s.shop_name }}</option>
            </select>

            <input class="input" type="date" [(ngModel)]="startDate" (change)="applyFilters()" />
            <input class="input" type="date" [(ngModel)]="endDate" (change)="applyFilters()" />

            <input

              class="search-input"

              type="text"

              placeholder="Search orders..."

              [(ngModel)]="searchQuery"

              (input)="applyFilters()"

            />

            <button class="btn-secondary" (click)="loadOrders()" [disabled]="isLoading">Refresh</button>

            <button class="btn-secondary" (click)="exportCsv()" [disabled]="isLoading || filteredOrders.length === 0">Export CSV</button>

          </div>

        </div>

        <div class="card-body">

          <div class="meta" *ngIf="isLoading">Loading...</div>

          <div class="meta error" *ngIf="errorMessage">{{ errorMessage }}</div>

          <div class="table-container" *ngIf="!isLoading">

            <table class="data-table">

              <thead>

                <tr>

                  <th>Order</th>

                  <th>Customer</th>

                  <th>Seller</th>

                  <th>Amount</th>

                  <th>Payment</th>

                  <th>Status</th>

                  <th>Date</th>

                  <th>Actions</th>

                </tr>

              </thead>

              <tbody>

                <tr *ngFor="let o of filteredOrders">

                  <td class="mono">{{ o.id }}</td>

                  <td>
                    <div>{{ o.customer_name || 'Unknown' }}</div>
                    <div class="muted" *ngIf="o.customer_email">{{ o.customer_email }}</div>
                  </td>

                  <td>{{ getSellerDisplay(o) }}</td>

                  <td>{{ o.total_amount | currency:'MAD':'symbol':'1.2-2' }}</td>

                  <td>{{ o.payment_method || '—' }}</td>

                  <td>

                    <span class="status-badge" [class.pending]="o.status==='pending'" [class.processing]="o.status==='processing'" [class.completed]="o.status==='completed'" [class.cancelled]="o.status==='cancelled'">

                      {{ o.status || 'pending' }}

                    </span>

                  </td>

                  <td>{{ formatDate(o.created_at) }}</td>

                  <td>

                    <div class="actions">

                      <select class="input small" [(ngModel)]="o._nextStatus" [disabled]="processingOrderId===o.id">

                        <option *ngFor="let s of statusOptions" [value]="s">{{ s }}</option>

                      </select>

                      <button

                        class="btn-primary"

                        (click)="saveStatus(o)"

                        [disabled]="processingOrderId===o.id || !o._nextStatus || o._nextStatus===o.status"

                      >Save</button>

                    </div>

                  </td>

                </tr>

                <tr *ngIf="filteredOrders.length === 0">

                  <td colspan="8" class="empty">No orders yet – data coming soon.</td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  `,
  styles: [`

    .page-container {

      display: flex;

      flex-direction: column;

      gap: 1.5rem;

    }

    .muted {

      font-size: 0.75rem;

      color: #64748b;

      font-weight: 700;

      margin-top: 0.15rem;

    }

    .page-header {

      position: relative;

    }

    .new-badge {

      position: absolute;

      top: 0;

      right: 0;

      background: #ef4444;

      color: white;

      border-radius: 999px;

      padding: 0.25rem 0.65rem;

      font-size: 0.75rem;

      font-weight: 900;

      border: 2px solid white;

    }

    .page-header h1 {

      margin: 0 0 0.5rem 0;

      font-size: 1.875rem;

      font-weight: 800;

      color: #0f172a;

    }

    .page-header p {

      margin: 0;

      color: #64748b;

      font-size: 1rem;

    }

    .stats-grid {

      display: grid;

      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));

      gap: 1.25rem;

    }

    .stat-card {

      background: white;

      border-radius: 12px;

      padding: 1.25rem;

      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      border: 1px solid #e2e8f0;

      display: flex;

      align-items: center;

      gap: 1rem;

    }

    .stat-icon {

      width: 44px;

      height: 44px;

      border-radius: 12px;

      display: flex;

      align-items: center;

      justify-content: center;

      color: white;

      font-size: 1.2rem;

      font-weight: 900;

    }

    .stat-icon.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }

    .stat-icon.orange { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

    .stat-icon.green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }

    .stat-icon.purple { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); }

    .stat-icon.red { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }

    .stat-icon.teal { background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%); }

    .stat-content h3 {

      margin: 0 0 0.25rem 0;

      font-size: 0.875rem;

      color: #64748b;

      font-weight: 700;

    }

    .stat-number {

      margin: 0;

      font-size: 1.5rem;

      font-weight: 900;

      color: #0f172a;

    }

    .content-card {

      background: white;

      border-radius: 12px;

      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      border: 1px solid #e2e8f0;

      overflow: hidden;

    }

    .card-header {

      display: flex;

      justify-content: space-between;

      align-items: center;

      padding: 1.25rem;

      border-bottom: 1px solid #e2e8f0;

      gap: 1rem;

    }

    .card-header h3 {

      margin: 0;

      font-size: 1.125rem;

      font-weight: 800;

      color: #0f172a;

    }

    .header-actions {

      display: flex;

      align-items: center;

      gap: 0.75rem;

      flex-wrap: wrap;

      justify-content: flex-end;

    }

    .input {

      padding: 0.55rem 0.8rem;

      border: 1px solid #e2e8f0;

      border-radius: 10px;

      font-size: 0.9rem;

      outline: none;

      background: white;

    }

    .input.small {

      padding: 0.45rem 0.6rem;

      border-radius: 10px;

      font-size: 0.85rem;

    }

    .search-input {

      padding: 0.55rem 0.9rem;

      border: 1px solid #e2e8f0;

      border-radius: 10px;

      font-size: 0.9rem;

      width: 280px;

      outline: none;

    }

    .search-input:focus,

    .input:focus {

      border-color: #93c5fd;

      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);

    }

    .card-body {

      padding: 1.25rem;

    }

    .meta {

      font-size: 0.9rem;

      color: #64748b;

      margin-bottom: 0.75rem;

      font-weight: 600;

    }

    .meta.error {

      color: #b91c1c;

    }

    .table-container {

      overflow-x: auto;

    }

    .data-table {

      width: 100%;

      border-collapse: collapse;

    }

    .data-table th {

      text-align: left;

      padding: 0.75rem;

      background: #f8fafc;

      font-weight: 900;

      color: #334155;

      font-size: 0.85rem;

      border-bottom: 1px solid #e5e7eb;

    }

    .data-table td {

      padding: 0.75rem;

      border-bottom: 1px solid #e5e7eb;

      font-size: 0.9rem;

      color: #0f172a;

      vertical-align: top;

    }

    .mono {

      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

      font-size: 0.8rem;

      color: #334155;

      max-width: 260px;

      overflow: hidden;

      text-overflow: ellipsis;

      white-space: nowrap;

    }

    .status-badge {

      display: inline-flex;

      padding: 0.2rem 0.65rem;

      border-radius: 999px;

      font-size: 0.75rem;

      font-weight: 900;

      text-transform: capitalize;

      border: 1px solid transparent;

    }

    .status-badge.pending { background: rgba(245, 158, 11, 0.12); color: #b45309; border-color: rgba(245, 158, 11, 0.25); }

    .status-badge.processing { background: rgba(59, 130, 246, 0.12); color: #1d4ed8; border-color: rgba(59, 130, 246, 0.25); }

    .status-badge.completed { background: rgba(16, 185, 129, 0.12); color: #047857; border-color: rgba(16, 185, 129, 0.25); }

    .status-badge.cancelled { background: rgba(239, 68, 68, 0.12); color: #b91c1c; border-color: rgba(239, 68, 68, 0.25); }

    .actions {

      display: flex;

      gap: 0.5rem;

      flex-wrap: wrap;

      align-items: center;

      justify-content: flex-end;

    }

    .btn-primary,

    .btn-secondary {

      border: none;

      padding: 0.45rem 0.75rem;

      border-radius: 10px;

      font-weight: 900;

      cursor: pointer;

      font-size: 0.8rem;

    }

    .btn-primary {

      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

      color: white;

    }

    .btn-secondary {

      background: #f1f5f9;

      color: #0f172a;

      border: 1px solid #e2e8f0;

    }

    button:disabled {

      opacity: 0.6;

      cursor: not-allowed;

    }

    .empty {

      text-align: center;

      color: #64748b;

      padding: 2rem 0;

      font-weight: 700;

    }

  `]
})
export class OrdersPageComponent implements OnInit, OnDestroy {

  orders: (Order & { _nextStatus?: string })[] = [];

  filteredOrders: (Order & { _nextStatus?: string })[] = [];

  isLoading = true;

  errorMessage = '';

  statusFilter: 'all' | string = 'all';

  sellerFilter: 'all' | string = 'all';

  startDate = '';

  endDate = '';

  searchQuery = '';

  processingOrderId: string | null = null;

  statusOptions = ['pending', 'processing', 'completed', 'cancelled'];

  sellers: Seller[] = [];

  private sellersByUserId = new Map<string, Seller>();

  private newOrdersSub: Subscription | null = null;

  newOrdersCount = 0;



  constructor(
    private orderService: OrderService,
    private sellerService: SellerService,
    private cdr: ChangeDetectorRef
  ) {}



  ngOnInit(): void {

    this.loadOrders();

    this.loadSellers();

    this.newOrdersSub = this.orderService.listenForNewOrders().subscribe({
      next: () => {
        this.newOrdersCount += 1;
        this.cdr.detectChanges();
      },
      error: () => {
      }
    });

  }

  ngOnDestroy(): void {
    if (this.newOrdersSub) {
      this.newOrdersSub.unsubscribe();
      this.newOrdersSub = null;
    }
  }



  loadOrders(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();

    this.orderService.getAllOrders().subscribe({

      next: (data) => {

        this.orders = (data || []).map((o) => ({ ...o, _nextStatus: o.status || 'pending' }));

        this.newOrdersCount = 0;

        this.applyFilters();

        this.isLoading = false;

        this.cdr.detectChanges();

      },

      error: (err) => {

        this.errorMessage = err?.message || 'Failed to load orders';

        this.orders = [];

        this.filteredOrders = [];

        this.isLoading = false;

        this.cdr.detectChanges();

      }

    });

  }

  loadSellers(): void {
    this.sellerService.getAllSellers().subscribe({
      next: (data) => {
        this.sellers = data || [];
        this.sellersByUserId = new Map<string, Seller>((this.sellers || []).map((s) => [s.user_id, s] as const));
        this.cdr.detectChanges();
      },
      error: () => {
        this.sellers = [];
        this.sellersByUserId = new Map<string, Seller>();
        this.cdr.detectChanges();
      }
    });
  }



  applyFilters(): void {

    const q = (this.searchQuery || '').trim().toLowerCase();

    const byStatus = this.statusFilter === 'all'

      ? this.orders

      : this.orders.filter((o) => (o.status || 'pending') === this.statusFilter);

    const bySeller = this.sellerFilter === 'all'
      ? byStatus
      : byStatus.filter((o) => (o.seller_ids || []).includes(this.sellerFilter));

    const start = this.startDate ? new Date(`${this.startDate}T00:00:00`) : null;
    const end = this.endDate ? new Date(`${this.endDate}T23:59:59.999`) : null;

    const byDate = (!start && !end)
      ? bySeller
      : bySeller.filter((o) => {
          const d = o.created_at ? new Date(o.created_at) : null;
          if (!d || isNaN(d.getTime())) return false;
          if (start && d < start) return false;
          if (end && d > end) return false;
          return true;
        });

    this.filteredOrders = !q
      ? [...byDate]
      : byDate.filter((o) => {
          const hay = `${o.id || ''} ${o.customer_name || ''} ${o.customer_email || ''} ${o.status || ''} ${o.payment_method || ''}`.toLowerCase();
          return hay.includes(q);
        });

  }



  getCount(status: string): number {

    return (this.orders || []).filter((o) => (o.status || 'pending') === status).length;

  }



  getOrdersTodayCount(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    return (this.orders || []).filter((o) => {
      const d = o.created_at ? new Date(o.created_at) : null;
      if (!d || isNaN(d.getTime())) return false;
      return d >= start && d <= end;
    }).length;
  }



  getRevenue(): number {
    return (this.orders || [])
      .filter((o) => (o.status || 'pending') === 'completed')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  }



  getSellerDisplay(order: Order): string {
    const ids = order?.seller_ids || [];
    if (!ids || ids.length === 0) return '—';

    const names = ids
      .map((id) => {
        const seller = this.sellersByUserId.get(id);
        return seller?.shop_name || seller?.full_name || id;
      })
      .filter((v) => !!v);

    return names.join(', ');
  }



  exportCsv(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const header = ['id', 'customer_name', 'customer_email', 'sellers', 'total_amount', 'payment_method', 'status', 'created_at'];
    const rows = (this.filteredOrders || []).map((o) => ({
      id: o.id,
      customer_name: o.customer_name,
      customer_email: o.customer_email || '',
      sellers: this.getSellerDisplay(o),
      total_amount: o.total_amount,
      payment_method: o.payment_method || '',
      status: o.status,
      created_at: o.created_at
    }));

    const escape = (v: any) => {
      const s = `${v ?? ''}`.replace(/\r?\n/g, ' ');
      if (s.includes(',') || s.includes('"')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const csv = [header.join(',')]
      .concat(rows.map((r) => header.map((k) => escape((r as any)[k])).join(',')))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }



  saveStatus(order: Order & { _nextStatus?: string }): void {

    if (this.processingOrderId) return;

    const next = order._nextStatus;

    if (!next || next === order.status) return;

    this.processingOrderId = order.id;

    this.cdr.detectChanges();

    this.orderService.updateOrderStatus(order.id, next).subscribe({

      next: (ok) => {

        if (!ok) {

          this.errorMessage = 'Update failed. Please check RLS policies and try again.';

          this.processingOrderId = null;

          this.cdr.detectChanges();

          return;

        }

        this.processingOrderId = null;

        this.cdr.detectChanges();

        this.loadOrders();

      },

      error: (err) => {

        this.errorMessage = err?.message || 'Update failed';

        this.processingOrderId = null;

        this.cdr.detectChanges();

      }

    });

  }



  formatDate(dateString: string): string {

    return dateString ? new Date(dateString).toLocaleDateString() : '—';

  }

}
