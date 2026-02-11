import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent, Product } from '../../../shared/product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CheckoutFlowService } from '../../services/checkout-flow.service';

@Component({
    selector: 'app-best-sellers',
    standalone: true,
    imports: [CommonModule, ProductCardComponent],
    templateUrl: './best-sellers.component.html',
    styleUrls: ['./best-sellers.component.css']
})
export class BestSellersComponent implements OnInit {
    bestSellers: Product[] = [];
    isLoading: boolean = true;
    errorMessage: string = '';

    constructor(
        private productService: ProductService,
        private cartService: CartService,
        private checkoutFlowService: CheckoutFlowService
    ) { }

    ngOnInit() {
        this.loadBestSellers();
    }

    loadBestSellers() {
        this.isLoading = true;
        this.productService.getBestSellers().subscribe({
            next: (products) => {
                this.bestSellers = products;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading best sellings:', error);
                this.errorMessage = 'Failed to load best sellings.';
                this.isLoading = false;
            }
        });
    }

    onAddToCart(product: Product) {
        this.cartService.addToCart(product, product.colors[0], 1);
    }

    onBuyNow(product: Product) {
        this.checkoutFlowService.buyNow(product, product.colors[0], 1);
    }
}
