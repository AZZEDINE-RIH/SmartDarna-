import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Seller, SellerService } from '../../../../services/seller.service';

@Component({
  selector: 'app-sellers-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Sellers Management</h1>
          <p>Manage seller applications, approvals, and performance</p>
        </div>

        <div class="page-actions">
          <button class="btn-primary" type="button" (click)="openCreate()" [disabled]="isLoading">+ New Seller</button>
          <button class="btn-secondary" type="button" (click)="loadSellers()" [disabled]="isLoading">Refresh</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">🏪</div>
          <div class="stat-content">
            <h3>Total Sellers</h3>
            <p class="stat-number">{{ sellers.length }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">⏳</div>
          <div class="stat-content">
            <h3>Pending</h3>
            <p class="stat-number">{{ counts.pending }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">✅</div>
          <div class="stat-content">
            <h3>Active</h3>
            <p class="stat-number">{{ counts.active }}</p>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="card-header">
          <h3>Seller List</h3>
          <div class="header-actions">
            <input
              class="search-input"
              type="text"
              placeholder="Search sellers..."
              [(ngModel)]="searchQuery"
              (input)="applyFilters()"
            />
          </div>
        </div>
        <div class="card-body">
          <div class="tabs">
            <button class="tab" [class.active]="statusFilter === 'all'" (click)="setStatusFilter('all')">All</button>
            <button class="tab" [class.active]="statusFilter === 'pending'" (click)="setStatusFilter('pending')">Pending ({{ counts.pending }})</button>
            <button class="tab" [class.active]="statusFilter === 'approved'" (click)="setStatusFilter('approved')">Approved ({{ counts.approved }})</button>
            <button class="tab" [class.active]="statusFilter === 'active'" (click)="setStatusFilter('active')">Active ({{ counts.active }})</button>
            <button class="tab" [class.active]="statusFilter === 'rejected'" (click)="setStatusFilter('rejected')">Rejected ({{ counts.rejected }})</button>
          </div>

          <div class="meta" *ngIf="isLoading">Loading sellers...</div>
          <div class="meta error" *ngIf="errorMessage">{{ errorMessage }}</div>

          <div class="table-container" *ngIf="!isLoading">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Shop</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of filteredSellers">
                  <td>
                    <div class="seller-info">
                      <img [src]="getAvatar(s.name)" [alt]="s.name" />
                      <div class="seller-meta">
                        <div class="seller-name" [title]="s.name">{{ s.name }}</div>
                        <div class="seller-email" [title]="s.email">{{ s.email || '—' }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="shop-name">{{ s.shop_name || '—' }}</div>
                  </td>
                  <td>
                    <span class="status-badge" [class.pending]="s.status==='pending'" [class.approved]="s.status==='approved'" [class.active]="s.status==='active'" [class.rejected]="s.status==='rejected'">
                      {{ s.status }}
                    </span>
                  </td>
                  <td>{{ formatDate(s.created_at) }}</td>
                  <td>
                    <div class="actions">
                      <button
                        class="btn-secondary"
                        *ngIf="s.status==='pending'"
                        (click)="updateStatus(s, 'rejected')"
                        [disabled]="processingSellerId === s.id"
                      >Reject</button>
                      <button
                        class="btn-primary"
                        *ngIf="s.status==='pending'"
                        (click)="updateStatus(s, 'approved')"
                        [disabled]="processingSellerId === s.id"
                      >Approve</button>
                      <button
                        class="btn-primary"
                        *ngIf="s.status==='approved'"
                        (click)="updateStatus(s, 'active')"
                        [disabled]="processingSellerId === s.id"
                      >Activate</button>
                      <button
                        class="btn-secondary"
                        *ngIf="s.status==='active'"
                        (click)="updateStatus(s, 'approved')"
                        [disabled]="processingSellerId === s.id"
                      >Deactivate</button>
                      <button
                        class="btn-primary"
                        *ngIf="s.status==='rejected'"
                        (click)="updateStatus(s, 'approved')"
                        [disabled]="processingSellerId === s.id"
                      >Re-Approve</button>

                      <button
                        class="btn-secondary"
                        type="button"
                        (click)="openEdit(s)"
                        [disabled]="processingSellerId === s.id"
                      >Edit</button>

                      <button
                        class="btn-danger"
                        (click)="deleteSeller(s)"
                        [disabled]="processingSellerId === s.id"
                        title="Delete Seller"
                      >Delete</button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredSellers.length === 0">
                  <td colspan="5" class="empty">No sellers found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="modal-backdrop" *ngIf="showCreate || showEdit" (click)="closeModals()"></div>

      <div class="modal" *ngIf="showCreate">
        <div class="modal-header">
          <h3>New Seller</h3>
          <button class="icon-btn" type="button" (click)="closeModals()">✕</button>
        </div>
        <form class="modal-body" (ngSubmit)="createSeller()">
          <div class="form-row">
            <label>Name</label>
            <input class="input" [(ngModel)]="createModel.name" name="createName" required />
          </div>
          <div class="form-row">
            <label>Email</label>
            <input class="input" [(ngModel)]="createModel.email" name="createEmail" type="email" required />
          </div>
          <div class="form-row">
            <label>Password</label>
            <input class="input" [(ngModel)]="createModel.password" name="createPassword" type="password" required />
          </div>
          <div class="form-row">
            <label>Shop name</label>
            <input class="input" [(ngModel)]="createModel.shop_name" name="createShop" required />
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" type="button" (click)="closeModals()" [disabled]="isSaving">Cancel</button>
            <button class="btn-primary" type="submit" [disabled]="isSaving">Create</button>
          </div>
        </form>
      </div>

      <div class="modal" *ngIf="showEdit">
        <div class="modal-header">
          <h3>Edit Seller</h3>
          <button class="icon-btn" type="button" (click)="closeModals()">✕</button>
        </div>
        <form class="modal-body" (ngSubmit)="saveEdit()">
          <div class="form-row">
            <label>Seller</label>
            <div class="readonly">{{ editModel.name || '—' }} <span class="muted">({{ editModel.email || '—' }})</span></div>
          </div>
          <div class="form-row">
            <label>Shop name</label>
            <input class="input" [(ngModel)]="editModel.shop_name" name="editShop" required />
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" type="button" (click)="closeModals()" [disabled]="isSaving">Cancel</button>
            <button class="btn-primary" type="submit" [disabled]="isSaving">Save</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
    }

    .page-actions {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
      align-items: center;
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
      font-size: 1.25rem;
      font-weight: 800;
    }
    .stat-icon.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .stat-icon.green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .stat-icon.orange { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .stat-content h3 {
      margin: 0 0 0.25rem 0;
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 600;
    }
    .stat-number {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
    }
    .page-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.875rem;
      font-weight: 700;
      color: #1e293b;
    }
    .page-header p {
      margin: 0;
      color: #64748b;
      font-size: 1rem;
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
    }
    .card-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 700;
      color: #0f172a;
    }
    .header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    .search-input {
      padding: 0.55rem 0.9rem;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.9rem;
      width: 280px;
      outline: none;
    }
    .search-input:focus {
      border-color: #93c5fd;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
    }
    .card-body {
      padding: 1.25rem;
    }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .tab {
      border: 1px solid #e2e8f0;
      background: #ffffff;
      padding: 0.5rem 0.8rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 700;
      color: #334155;
      font-size: 0.85rem;
    }
    .tab.active {
      background: rgba(102, 126, 234, 0.1);
      border-color: rgba(102, 126, 234, 0.35);
      color: #4f46e5;
    }
    .meta {
      font-size: 0.9rem;
      color: #64748b;
      margin-bottom: 0.75rem;
    }
    .meta.error {
      color: #b91c1c;
      font-weight: 600;
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
      font-weight: 800;
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
    .seller-info {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    .seller-info img {
      width: 38px;
      height: 38px;
      border-radius: 12px;
    }
    .seller-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .seller-name {
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 280px;
    }
    .seller-email {
      color: #64748b;
      font-size: 0.8rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 280px;
    }
    .shop-name {
      font-weight: 800;
    }
    .shop-desc {
      color: #64748b;
      font-size: 0.8rem;
      margin-top: 0.15rem;
      max-width: 420px;
    }
    .status-badge {
      display: inline-flex;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: capitalize;
      border: 1px solid transparent;
    }
    .status-badge.pending { background: rgba(245, 158, 11, 0.12); color: #b45309; border-color: rgba(245, 158, 11, 0.25); }
    .status-badge.approved { background: rgba(59, 130, 246, 0.12); color: #1d4ed8; border-color: rgba(59, 130, 246, 0.25); }
    .status-badge.active { background: rgba(16, 185, 129, 0.12); color: #047857; border-color: rgba(16, 185, 129, 0.25); }
    .status-badge.rejected { background: rgba(239, 68, 68, 0.12); color: #b91c1c; border-color: rgba(239, 68, 68, 0.25); }
    .actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .btn-primary,
    .btn-secondary,
    .btn-danger {
      border: none;
      padding: 0.45rem 0.75rem;
      border-radius: 10px;
      font-weight: 800;
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
    .btn-danger {
      background: #fee2e2;
      color: #ef4444;
      border: 1px solid #fecaca;
    }

    .btn-primary:hover:enabled { transform: translateY(-1px); }
    .btn-secondary:hover:enabled { background: #eaf0f7; }
    .btn-danger:hover:enabled { background: #fecaca; }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .empty {
      text-align: center;
      color: #64748b;
      padding: 2rem 0;
      font-weight: 600;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      z-index: 50;
    }

    .modal {
      position: fixed;
      top: 12vh;
      left: 50%;
      transform: translateX(-50%);
      width: min(560px, calc(100vw - 32px));
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      box-shadow: 0 30px 80px rgba(15, 23, 42, 0.25);
      z-index: 60;
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 900;
      color: #0f172a;
    }

    .icon-btn {
      border: 1px solid #e2e8f0;
      background: #ffffff;
      border-radius: 10px;
      width: 36px;
      height: 36px;
      cursor: pointer;
      font-weight: 900;
      color: #334155;
    }

    .modal-body {
      padding: 1rem 1.1rem 1.1rem 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .form-row {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-row label {
      font-size: 0.85rem;
      font-weight: 800;
      color: #334155;
    }

    .input {
      padding: 0.6rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      outline: none;
      font-size: 0.95rem;
    }

    .input:focus {
      border-color: #93c5fd;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
    }

    textarea.input {
      resize: vertical;
      min-height: 92px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.6rem;
      margin-top: 0.25rem;
    }

    .readonly {
      padding: 0.6rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #f8fafc;
      font-weight: 800;
      color: #0f172a;
    }

    .muted {
      color: #64748b;
      font-weight: 800;
    }
  `]
})
export class SellersPageComponent implements OnInit {
  sellers: Seller[] = [];
  filteredSellers: Seller[] = [];
  isLoading = true;
  errorMessage = '';
  statusFilter: 'all' | Seller['status'] = 'all';
  searchQuery = '';
  processingSellerId: string | null = null;
  isSaving = false;

  showCreate = false;
  showEdit = false;

  createModel = {
    name: '',
    email: '',
    password: '',
    shop_name: ''
  };

  editTarget: Seller | null = null;
  editModel: {
    name: string;
    email?: string;
    shop_name: string;
  } = {
      name: '',
      email: '',
      shop_name: ''
    };
  counts = {
    pending: 0,
    approved: 0,
    active: 0,
    rejected: 0,
  };

  constructor(
    private sellerService: SellerService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadSellers();
  }

  loadSellers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    this.sellerService.getAllSellers().subscribe({
      next: (data) => {
        this.sellers = data || [];
        this.updateCounts();
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Failed to load sellers';
        this.sellers = [];
        this.filteredSellers = [];
        this.updateCounts();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  setStatusFilter(filter: 'all' | Seller['status']): void {
    this.statusFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    const q = (this.searchQuery || '').trim().toLowerCase();
    const byStatus = this.statusFilter === 'all'
      ? this.sellers
      : this.sellers.filter((s) => s.status === this.statusFilter);
    this.filteredSellers = !q
      ? [...byStatus]
      : byStatus.filter((s) => {
        const hay = `${s.name || ''} ${s.shop_name || ''} ${s.email || ''}`.toLowerCase();
        return hay.includes(q);
      });
  }

  openCreate(): void {
    this.errorMessage = '';
    this.showEdit = false;
    this.showCreate = true;
    this.isSaving = false;
    this.createModel = { name: '', email: '', password: '', shop_name: '' };
  }

  openEdit(seller: Seller): void {
    this.errorMessage = '';
    this.showCreate = false;
    this.showEdit = true;
    this.isSaving = false;
    this.editTarget = seller;
    this.editModel = {
      name: seller.name,
      email: seller.email,
      shop_name: seller.shop_name || ''
    };
  }

  closeModals(): void {
    if (this.isSaving) return;
    this.showCreate = false;
    this.showEdit = false;
    this.editTarget = null;
  }

  async createSeller(): Promise<void> {
    if (this.isSaving) return;
    this.errorMessage = '';

    const payload = {
      name: (this.createModel.name || '').trim(),
      email: (this.createModel.email || '').trim(),
      password: (this.createModel.password || '').trim(),
      shop_name: (this.createModel.shop_name || '').trim()
    };

    if (!payload.name || !payload.email || !payload.password || !payload.shop_name) {
      this.errorMessage = 'Please fill all fields (Name, Email, Password, Shop name).';
      return;
    }

    if (payload.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      return;
    }

    this.isSaving = true;
    this.cdr.detectChanges();

    const result = await this.sellerService.createSellerAccount(
      payload.email,
      payload.password,
      payload.name,
      payload.shop_name
    );

    this.isSaving = false;

    if (!result.success) {
      this.errorMessage = result.message || 'Failed to create seller account';
      this.cdr.detectChanges();
      return;
    }

    this.closeModals();
    this.loadSellers();
  }

  saveEdit(): void {
    if (this.isSaving) return;
    if (!this.editTarget) return;
    this.errorMessage = '';

    const shop_name = (this.editModel.shop_name || '').trim();

    if (!shop_name) {
      this.errorMessage = 'Shop name is required.';
      return;
    }

    this.isSaving = true;
    this.cdr.detectChanges();
    this.sellerService.updateSellerDetails(this.editTarget.id, { shop_name }).subscribe({
      next: (ok: boolean) => {
        if (!ok) {
          this.errorMessage = 'Save failed. Please check RLS policies and try again.';
          this.isSaving = false;
          this.cdr.detectChanges();
          return;
        }
        this.isSaving = false;
        this.closeModals();
        this.loadSellers();
      },
      error: (err: any) => {
        this.errorMessage = err?.message || 'Save failed';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(seller: Seller, status: Seller['status']): void {
    if (this.processingSellerId) return;
    this.processingSellerId = seller.id;
    this.cdr.detectChanges();
    this.sellerService.updateSellerStatus(seller.id, status).subscribe({
      next: (ok) => {
        if (!ok) {
          this.errorMessage = 'Action failed. Please check RLS policies and try again.';
          this.processingSellerId = null;
          this.cdr.detectChanges();
          return;
        }
        this.processingSellerId = null;
        this.cdr.detectChanges();
        this.loadSellers();
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Action failed';
        this.processingSellerId = null;
        this.cdr.detectChanges();
      },
    });
  }

  deleteSeller(seller: Seller): void {
    if (this.processingSellerId) return;
    if (!confirm(`Are you sure you want to delete seller "${seller.shop_name}"? This action cannot be undone.`)) return;

    this.processingSellerId = seller.id;
    this.cdr.detectChanges();
    this.sellerService.deleteSeller(seller.id).subscribe({
      next: (ok) => {
        if (!ok) {
          this.errorMessage = 'Delete failed. Please check RLS policies and try again.';
          this.processingSellerId = null;
          this.cdr.detectChanges();
          return;
        }
        this.processingSellerId = null;
        this.cdr.detectChanges();
        this.loadSellers();
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Delete failed';
        this.processingSellerId = null;
        this.cdr.detectChanges();
      },
    });
  }

  private updateCounts(): void {
    const c = { pending: 0, approved: 0, active: 0, rejected: 0 };
    (this.sellers || []).forEach((s) => {
      // Since we're using profiles table now, status is either 'active' or 'inactive'
      // Map to the counts structure for UI compatibility
      if (s.status === 'active') c.active += 1;
      if (s.status === 'inactive') c.rejected += 1;
    });
    this.counts = c;
  }

  getAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Seller')}&background=667eea&color=fff`;
  }

  formatDate(dateString: string): string {
    return dateString ? new Date(dateString).toLocaleDateString() : '—';
  }
}
