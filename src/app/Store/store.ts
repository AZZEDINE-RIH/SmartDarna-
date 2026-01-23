import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Product } from '../models/product.model';
import { PRODUCTS } from '../data/products';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store.html',
})
export class Store {

  // ==========================
  // DATA
  // ==========================
  products: Product[] = PRODUCTS;

  // ==========================
  // CATEGORIES
  // ==========================
  private readonly categoryIconMap: Record<string, string> = {
    'Smart Hub': 'devices',
    Thermostat: 'thermostat',
    Doorbell: 'notifications',
    Lock: 'lock',
  };

  categories = [
    { name: 'All', icon: 'grid' },
    ...Array.from(new Set(this.products.map(p => p.category))).map(name => ({
      name,
      icon: this.categoryIconMap[name] ?? 'circle',
    })),
  ];

  selectedCategory = signal<string>('All');

  // ==========================
  // BRANDS
  // ==========================
  brands = Array.from(
    new Set(this.products.map(p => p.brand))
  ).map(name => ({
    name,
    selected: false
  }));

  // ==========================
  // PRICE
  // ==========================
  minPrice = 0;
  maxPrice = Math.max(...this.products.map(p => p.price));
  selectedPrice = signal<number>(this.maxPrice);

  // ==========================
  // PAGINATION
  // ==========================
  currentPage = 1;
  pageSize = 6;

  // ==========================
  // FILTER PRODUCTS
  // ==========================
  filteredProducts(): Product[] {
    const category = this.selectedCategory();
    const selectedBrands =
      this.brands.filter(b => b.selected).map(b => b.name);

    return this.products.filter(p => {

      const matchCategory =
        category === 'All' || p.category === category;

      const matchBrand =
        selectedBrands.length === 0 ||
        selectedBrands.includes(p.brand);

      const matchPrice =
        p.price <= this.selectedPrice();

      return matchCategory && matchBrand && matchPrice;
    });
  }

  // ==========================
  // PAGINATED PRODUCTS
  // ==========================
  get paginatedProducts(): Product[] {
    const start =
      (this.currentPage - 1) * this.pageSize;

    return this.filteredProducts().slice(
      start,
      start + this.pageSize
    );
  }

  // ==========================
  // TOTAL PAGES
  // ==========================
  get totalPages(): number {
    return Math.ceil(
      this.filteredProducts().length / this.pageSize
    ) || 1;
  }

  totalPagesArray(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );
  }

  changePage(page: number) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
  }

  // ==========================
  // ACTIONS
  // ==========================
  clearFilters() {
    this.selectedCategory.set('All');
    this.brands.forEach(b => b.selected = false);
    this.selectedPrice.set(this.maxPrice);
    this.currentPage = 1;
  }

  // ⭐ rating stars
  getStars(rating = 0) {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }
}
