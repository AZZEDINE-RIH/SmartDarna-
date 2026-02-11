import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../shared/product-card/product-card.component';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [CommonModule, FormsModule],
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
    isTransitioning: boolean = false;
    activeTab: string = 'description';

    @ViewChild('loadingState', { static: true }) loadingState!: TemplateRef<any>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private productService: ProductService,
        private cartService: CartService
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            console.log('📌 ProductDetails: Route param ID:', id);

            if (id) {
                this.loadProduct(id);
            } else {
                this.error = 'Invalid product ID';
                this.isLoading = false;
            }
        });
    }

    loadProduct(id: string) {
        console.log('🔄 ProductDetails: Loading product...', id);
        this.isLoading = true;
        this.error = '';
        this.product = undefined;

        this.productService.getProductById(id).subscribe({
            next: (product) => {
                console.log('✅ ProductDetails: Received product:', product?.name);
                this.product = product;

                if (product) {
                    this.selectedImage = (product.images && product.images.length > 0) ? product.images[0] : '';
                    this.selectedColor = (product.colors && product.colors.length > 0) ? product.colors[0] : '';
                } else {
                    this.error = 'Product not found';
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('❌ ProductDetails: Error loading product:', err);
                this.error = err.message || 'Failed to load product details';
                this.isLoading = false;
            },
            complete: () => {
                console.log('🏁 ProductDetails: Loading complete');
                // Ensure loading is false even if something weird happens
                if (this.isLoading) this.isLoading = false;
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
        if (this.selectedColor === color) return; // Don't transition if same color

        this.selectedColor = color;

        // Update product image based on selected color
        const colorImageMap: { [key: string]: string } = {
            'Black': 'assets/products/smart-light-black.jpg',
            'White': 'assets/products/smart-light-white.jpg',
            'Silver': 'assets/products/smart-light-silver.jpg',
            'Blue': 'assets/products/smart-light-blue.jpg',
            'Red': 'assets/products/smart-light-red.jpg',
            'Green': 'assets/products/smart-light-green.jpg',
            'Gray': 'assets/products/smart-light-gray.jpg',
            'Gold': 'assets/products/smart-light-gold.jpg'
        };

        // Start transition
        this.isTransitioning = true;

        // Update selected image if color has mapped image
        if (colorImageMap[color]) {
            // Small delay for smooth transition effect
            setTimeout(() => {
                this.selectedImage = colorImageMap[color];
                // End transition after image loads
                setTimeout(() => {
                    this.isTransitioning = false;
                }, 300);
            }, 150);
        } else {
            this.isTransitioning = false;
        }
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

    onBuyNow() {
        if (!this.product) return;

        // Direct checkout without authentication
        this.proceedToCheckout();
    }

    private proceedToCheckout() {
        if (this.product) {
            this.cartService.addToCart(this.product, this.selectedColor, this.quantity);
            this.router.navigate(['/checkout']);
        }
    }
}
