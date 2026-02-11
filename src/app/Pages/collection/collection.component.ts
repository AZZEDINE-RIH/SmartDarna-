import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent, Product } from '../../shared/product-card/product-card.component';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { CheckoutFlowService } from '../services/checkout-flow.service';

@Component({
    selector: 'app-collection',
    standalone: true,
    imports: [CommonModule, FormsModule, ProductCardComponent],
    templateUrl: './collection.component.html',
    styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {
    products: Product[] = [];
    filteredProducts: Product[] = [];
    pagedProducts: Product[] = [];

    // Filters - Dynamic
    categories: string[] = ['All'];
    selectedCategory = 'All';

    brands: string[] = [];
    selectedBrands: { [key: string]: boolean } = {};

    maxPrice = 10000; // Increased default
    priceRange = 10000;

    // Pagination
    currentPage = 1;
    pageSize = 6;
    totalPages = 1;

    constructor(
        private productService: ProductService,
        private cartService: CartService,
        private checkoutFlowService: CheckoutFlowService
    ) { } // Removed initialization of selectedBrands here

    ngOnInit() {
        this.loadProducts();
        this.fetchFilters();
    }

    fetchFilters() {
        // Fetch categories from dedicated table
        this.productService.getCategories().subscribe(cats => {
            if (cats && cats.length > 0) {
                // Assuming categories have a 'name' property
                const catNames = cats.map(c => c.name || c.category_name).filter(n => n);
                this.categories = ['All', ...new Set(catNames)].sort();
            }
        });

        // Fetch brands from dedicated table
        this.productService.getBrands().subscribe(brands => {
            if (brands && brands.length > 0) {
                const brandNames = brands.map(b => b.name || b.brand_name).filter(n => n);
                this.brands = [...new Set(brandNames)].sort();

                // Refresh brands filter checkboxes
                this.selectedBrands = {};
                this.brands.forEach(brand => this.selectedBrands[brand] = false);
            }
        });
    }

    loadProducts() {
        this.productService.getProducts().subscribe(data => {
            this.products = data;

            // Fallback: If fetchFilters hasn't populated them yet, or tables are empty
            if (this.categories.length <= 1) {
                const uniqueCategories = Array.from(new Set(data.map(p => p.category).filter(c => c)));
                this.categories = ['All', ...uniqueCategories.sort()];
            }

            if (this.brands.length === 0) {
                const uniqueBrands = Array.from(new Set(data.map(p => p.brand).filter(b => b)));
                this.brands = uniqueBrands.sort();
                this.brands.forEach(brand => {
                    if (this.selectedBrands[brand] === undefined) {
                        this.selectedBrands[brand] = false;
                    }
                });
            }

            // Calculate max price for slider
            if (data.length > 0) {
                const max = Math.max(...data.map(p => p.price));
                if (max > 0) {
                    this.maxPrice = Math.ceil(max * 1.1);
                    this.priceRange = this.maxPrice;
                }
            }

            this.applyFilters();
        });
    }

    applyFilters() {
        this.filteredProducts = this.products.filter(p => {
            const matchCategory = this.selectedCategory === 'All' || p.category === this.selectedCategory;
            const matchPrice = p.price <= this.priceRange;

            const activeBrands = Object.keys(this.selectedBrands).filter(b => this.selectedBrands[b]);
            // If no brands selected, show all. If brands selected, must match one.
            const matchBrand = activeBrands.length === 0 || activeBrands.includes(p.brand);

            return matchCategory && matchPrice && matchBrand;
        });

        this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
        this.currentPage = 1;
        this.updatePagedProducts();
    }

    updatePagedProducts() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        this.pagedProducts = this.filteredProducts.slice(startIndex, startIndex + this.pageSize);
    }

    setPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updatePagedProducts();
            window.scrollTo(0, 0);
        }
    }

    onAddToCart(product: Product) {
        this.cartService.addToCart(product, product.colors[0], 1);
    }

    onBuyNow(product: Product) {
        this.checkoutFlowService.buyNow(product, product.colors[0], 1);
    }
}
