import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface Product {
    id: string;
    name: string;
    price: number;
    rating: number;
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

    onAddToCart() {
        this.addToCart.emit(this.product);
    }

    getStars(): number[] {
        return Array(5).fill(0).map((_, i) => i);
    }
}
