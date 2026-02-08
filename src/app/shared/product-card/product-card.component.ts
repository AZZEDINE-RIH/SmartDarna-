import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

export interface Product {
    id: string;
    name: string;
    price: number;
    rating: number;
    reviews: number;
    images: string[];
    colors: string[];
    category: string;
    brand: string;
    stock: number;
    bestSeller: boolean;
    description: string;
}

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './product-card.component.html',
    styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
    @Input() product!: Product;
    @Input() showBadge: boolean = true;
    @Output() addToCart = new EventEmitter<Product>();
    @Output() buyNow = new EventEmitter<Product>();

    constructor(private router: Router) {}

    onAddToCart() {
        this.addToCart.emit(this.product);
    }

    onBuyNow(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.buyNow.emit(this.product);
    }

    getStars(): number[] {
        return Array(5).fill(0).map((_, i) => i);
    }
}
