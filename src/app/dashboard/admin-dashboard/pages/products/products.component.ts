import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Products Management</h1>
        <p>Manage your product inventory, pricing, and availability</p>
      </div>
      
      <div class="content-card">
        <div class="card-header">
          <h3>Product List</h3>
          <button class="btn-primary" (click)="openCreate()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z"/>
            </svg>
            Add Product
          </button>
        </div>
        <div class="card-body">
          <div class="toolbar">
            <div class="search">
              <input
                class="search-input"
                type="text"
                placeholder="Search products..."
                [(ngModel)]="searchQuery"
              />
            </div>
            <div class="meta" *ngIf="isLoading">Loading...</div>
            <div class="meta error" *ngIf="errorMessage">{{ errorMessage }}</div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of filteredProducts">
                  <td>{{ p.name }}</td>
                  <td>{{ p.category_name || 'Uncategorized' }}</td>
                  <td>{{ p.price | currency:'USD':'symbol':'1.2-2' }}</td>
                  <td>{{ p.stock }}</td>
                  <td>
                    <button class="btn-icon" (click)="openEdit(p)" title="Edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button class="btn-icon" (click)="deleteProduct(p)" title="Delete">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="!isLoading && filteredProducts.length === 0">
                  <td colspan="5" class="empty">No products found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="modal-backdrop" *ngIf="isModalOpen" (click)="closeModal()"></div>
      <div class="modal" *ngIf="isModalOpen" role="dialog" aria-modal="true">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">{{ editingId ? 'Edit Product' : 'Add Product' }}</div>
            <button class="btn-icon" (click)="closeModal()" title="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <label class="field">
                <span>Name</span>
                <input class="input" type="text" [(ngModel)]="form.name" />
              </label>
              <label class="field">
                <span>Category</span>
                <select class="input" [(ngModel)]="form.category_id">
                  <option [ngValue]="null">Uncategorized</option>
                  <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
                </select>
              </label>
              <label class="field">
                <span>Price</span>
                <input class="input" type="number" step="0.01" [(ngModel)]="form.price" />
              </label>
              <label class="field">
                <span>Stock</span>
                <input class="input" type="number" [(ngModel)]="form.stock" />
              </label>
              <label class="field full">
                <span>Description</span>
                <textarea class="input" rows="3" [(ngModel)]="form.description"></textarea>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeModal()" [disabled]="isSaving">Cancel</button>
            <button class="btn-primary" (click)="saveProduct()" [disabled]="isSaving || !form.name">
              {{ isSaving ? 'Saving...' : 'Save' }}
            </button>
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
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .card-body {
      padding: 1.5rem;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 1rem;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .search {
      flex: 1;
      max-width: 420px;
    }

    .search-input {
      width: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.65rem 0.9rem;
      font-size: 0.9rem;
      outline: none;
    }

    .search-input:focus {
      border-color: #93c5fd;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
    }

    .meta {
      font-size: 0.875rem;
      color: #64748b;
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
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .data-table td {
      padding: 0.75rem;
      border-bottom: 1px solid #f3f4f6;
      font-size: 0.875rem;
      color: #374151;
    }

    .data-table tr:hover {
      background: #f9fafb;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.inactive {
      background: #fee2e2;
      color: #991b1b;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      margin-right: 0.5rem;
      border-radius: 4px;
      transition: background 0.2s;
      color: #334155;
    }

    .btn-icon:hover {
      background: #f3f4f6;
    }

    .empty {
      text-align: center;
      color: #64748b;
      padding: 1.25rem;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      z-index: 50;
    }

    .modal {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      z-index: 51;
      padding: 1rem;
    }

    .modal-card {
      width: 100%;
      max-width: 680px;
      background: white;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
    }

    .modal-body {
      padding: 1.25rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.85rem;
      color: #334155;
    }

    .field.full {
      grid-column: 1 / -1;
    }

    .field.checkbox {
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 0.75rem;
      padding-top: 1.25rem;
    }

    .input {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.65rem 0.8rem;
      font-size: 0.9rem;
      outline: none;
    }

    .input:focus {
      border-color: #93c5fd;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-top: 1px solid #e2e8f0;
      background: #fafafa;
    }

    .btn-secondary {
      border: 1px solid #e2e8f0;
      background: white;
      color: #334155;
      padding: 0.625rem 1.1rem;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-secondary:disabled,
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 720px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      .field.checkbox {
        padding-top: 0;
      }
    }
  `]
})
export class ProductsPageComponent implements OnInit {
  products: ProductRow[] = [];
  categories: CategoryRow[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  searchQuery = '';

  isModalOpen = false;
  editingId: string | null = null;
  form: ProductForm = {
    name: '',
    description: null,
    price: 0,
    stock: 0,
    category_id: null
  };

  constructor(private supabaseService: SupabaseService) {}

  get filteredProducts(): ProductRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.products;
    return this.products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category_name || '').toLowerCase();
      return name.includes(q) || cat.includes(q);
    });
  }

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    this.errorMessage = '';
    this.isLoading = true;
    try {
      await Promise.all([this.loadCategories(), this.loadProducts()]);
      this.applyCategoryNames();
    } catch (e: any) {
      this.errorMessage = e?.message || 'Failed to load products.';
    } finally {
      this.isLoading = false;
    }
  }

  private applyCategoryNames() {
    const map = new Map((this.categories || []).map(c => [c.id, c.name]));
    this.products = (this.products || []).map(p => ({
      ...p,
      category_name: p.category_id ? (map.get(p.category_id) ?? null) : null
    }));
  }

  private async loadCategories() {
    const { data, error } = await this.supabaseService.getClient()
      .from('categories')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) throw error;
    this.categories = (data || []) as CategoryRow[];
  }

  private async loadProducts() {
    const { data, error } = await this.supabaseService.getClient()
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        stock,
        category_id
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    this.products = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price ?? 0),
      stock: Number(p.stock ?? 0),
      category_id: p.category_id,
      category_name: null
    }));
  }

  openCreate() {
    this.editingId = null;
    this.form = {
      name: '',
      description: null,
      price: 0,
      stock: 0,
      category_id: null
    };
    this.isModalOpen = true;
    this.errorMessage = '';
  }

  openEdit(p: ProductRow) {
    this.editingId = p.id;
    this.form = {
      name: p.name,
      description: p.description ?? null,
      price: p.price,
      stock: p.stock,
      category_id: p.category_id ?? null
    };
    this.isModalOpen = true;
    this.errorMessage = '';
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingId = null;
  }

  async saveProduct() {
    if (!this.form.name?.trim()) return;
    this.isSaving = true;
    this.errorMessage = '';
    try {
      const payload: any = {
        name: this.form.name.trim(),
        description: this.form.description,
        price: Number(this.form.price ?? 0),
        stock: Number(this.form.stock ?? 0)
      };

      if (this.form.category_id) {
        payload.category_id = this.form.category_id;
      }

      if (this.editingId) {
        const { data, error } = await this.supabaseService.getClient()
          .from('products')
          .update(payload)
          .eq('id', this.editingId)
          .select('id, name, description, price, stock, category_id');
        if (error) {
          console.error('Update product error:', error, { editingId: this.editingId, payload });
          throw error;
        }

        if (!data || data.length === 0) {
          throw new Error('Update failed (no rows updated). Check RLS policies for UPDATE.');
        }

        const updated = data[0] as any;
        const idx = this.products.findIndex(p => p.id === this.editingId);
        const next: ProductRow = {
          id: updated.id,
          name: updated.name,
          description: updated.description ?? null,
          price: Number(updated.price ?? 0),
          stock: Number(updated.stock ?? 0),
          category_id: updated.category_id ?? null,
          category_name: null
        };
        if (idx >= 0) {
          this.products = [
            ...this.products.slice(0, idx),
            next,
            ...this.products.slice(idx + 1)
          ];
        }
      } else {
        const { data, error } = await this.supabaseService.getClient()
          .from('products')
          .insert([payload])
          .select('id, name, description, price, stock, category_id');
        if (error) {
          console.error('Insert product error:', error, { payload });
          throw error;
        }

        if (data && data.length > 0) {
          const inserted = data[0] as any;
          const next: ProductRow = {
            id: inserted.id,
            name: inserted.name,
            description: inserted.description ?? null,
            price: Number(inserted.price ?? 0),
            stock: Number(inserted.stock ?? 0),
            category_id: inserted.category_id ?? null,
            category_name: null
          };
          this.products = [next, ...this.products];
        }
      }

      this.applyCategoryNames();
      this.closeModal();
    } catch (e: any) {
      const msg = e?.message || 'Failed to save product.';
      const details = e?.details ? ` (${e.details})` : '';
      const hint = e?.hint ? ` Hint: ${e.hint}` : '';
      this.errorMessage = `${msg}${details}${hint}`;
    } finally {
      this.isSaving = false;
    }
  }

  async deleteProduct(p: ProductRow) {
    const ok = confirm(`Delete product "${p.name}"?`);
    if (!ok) return;
    this.errorMessage = '';
    try {
      const { error } = await this.supabaseService.getClient()
        .from('products')
        .delete()
        .eq('id', p.id);
      if (error) throw error;
      this.products = this.products.filter(x => x.id !== p.id);
    } catch (e: any) {
      this.errorMessage = e?.message || 'Failed to delete product.';
    }
  }
}

type CategoryRow = {
  id: string;
  name: string;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: string | null;
  category_name: string | null;
};

type ProductForm = {
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: string | null;
};
