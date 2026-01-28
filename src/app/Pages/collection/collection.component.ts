import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent, Product } from '../../shared/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';

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

    // Filters
    categories = ['All', 'Smart Hub', 'Thermostat', 'Doorbell', 'Lock', 'Smart Display', 'Speaker'];
    selectedCategory = 'All';

    brands = ['Amazon', 'Google', 'Apple', 'Ecobee', 'Nest', 'Ring', 'Arlo', 'Yale'];
    selectedBrands: { [key: string]: boolean } = {};

    maxPrice = 3500;
    priceRange = 3500;

    // Pagination
    currentPage = 1;
    pageSize = 6;
    totalPages = 1;

    constructor(
        private productService: ProductService,
        private cartService: CartService
    ) {
        this.brands.forEach(brand => this.selectedBrands[brand] = false);
    }

    ngOnInit() {
        this.loadProducts();
    }

    loadProducts() {
        this.productService.getProducts().subscribe(data => {
            this.products = data;
            this.applyFilters();
        });
    }

    applyFilters() {
        this.filteredProducts = this.products.filter(p => {
            const matchCategory = this.selectedCategory === 'All' || p.category === this.selectedCategory;
            const matchPrice = p.price <= this.priceRange;

            const activeBrands = Object.keys(this.selectedBrands).filter(b => this.selectedBrands[b]);
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
}
