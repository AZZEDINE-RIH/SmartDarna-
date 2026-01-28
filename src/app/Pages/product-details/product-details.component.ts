import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../shared/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './product-details.component.html',
    styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
    product: Product | undefined;
    quantity: number = 1;
    selectedColor: string = '';
    selectedImage: string = '';
    isLoading: boolean = true;
    error: string = '';

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = params['id'];
            this.loadProduct(id);
        });
    }

    loadProduct(id: string) {
        this.isLoading = true;
        this.error = '';
        this.productService.getProductById(id).subscribe({
            next: (product) => {
                this.product = product;
                if (this.product) {
                    this.selectedImage = this.product.images[0];
                    this.selectedColor = this.product.colors[0];
                } else {
                    this.error = 'Product not found';
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading product:', err);
                this.error = 'Failed to load product. Please try again.';
                this.isLoading = false;
            }
        });
    }

    updateQuantity(delta: number) {
        const newQty = this.quantity + delta;
        if (newQty >= 1) {
            this.quantity = newQty;
        }
    }

    selectColor(color: string) {
        this.selectedColor = color;
    }

    selectImage(image: string) {
        this.selectedImage = image;
    }

    getColorCode(color: string): string {
        const mapping: { [key: string]: string } = {
            // Basic colors
            'Black': '#000000',
            'White': '#ffffff',
            'Blue': '#4a90e2',
            'Orange': '#ff8c42',
            'Yellow': '#ffd93d',
            // Product-specific colors
            'Black Suede': '#2c2c2c',
            'Polished Brass': '#d4af37',
            'Oil Rubbed Bronze': '#3b3121',
            'Snow': '#f5f5f5',
            'Ash': '#b2beb5',
            'Linen': '#faf0e6',
            'Mist': '#90afc5',
            'Sand': '#c2b280',
            'Charcoal': '#36454f'
        };
        return mapping[color] || color.toLowerCase();
    }

    getStars(): number[] {
        return Array(5).fill(0).map((_, i) => i);
    }

    onAddToCart() {
        if (this.product) {
            this.cartService.addToCart(this.product, this.selectedColor, this.quantity);
            // Optionally redirect or show feedback
            console.log('Product added to cart via service');
        }
    }
}
