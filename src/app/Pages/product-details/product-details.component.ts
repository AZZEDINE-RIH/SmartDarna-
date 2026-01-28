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
        this.productService.getProductById(id).subscribe(product => {
            this.product = product;
            if (this.product) {
                this.selectedImage = this.product.images[0];
                this.selectedColor = this.product.colors[0];
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
