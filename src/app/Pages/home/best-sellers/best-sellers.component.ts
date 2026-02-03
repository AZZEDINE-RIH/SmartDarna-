import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent, Product } from '../../../shared/product-card/product-card.component';
import { CarouselComponent } from '../../../shared/carousel/carousel.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-best-sellers',
    standalone: true,
    imports: [CommonModule, ProductCardComponent, CarouselComponent],
    templateUrl: './best-sellers.component.html',
    styleUrls: ['./best-sellers.component.css']
})
export class BestSellersComponent implements OnInit {
    bestSellers: Product[] = [];

    constructor(
        private productService: ProductService,
        private cartService: CartService
    ) { }

    ngOnInit() {
        this.productService.getBestSellers().subscribe(products => {
            this.bestSellers = products;
        });
    }

    onAddToCart(product: Product) {
        this.cartService.addToCart(product, product.colors[0], 1);
    }
}
