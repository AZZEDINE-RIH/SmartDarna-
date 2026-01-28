import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../../shared/product-card/product-card.component';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private dataUrl = '/assets/data/products.json';

    constructor(private http: HttpClient) { }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.dataUrl);
    }

    getProductById(id: string): Observable<Product | undefined> {
        return this.getProducts().pipe(
            map(products => products.find(p => p.id === id))
        );
    }

    getBestSellers(): Observable<Product[]> {
        return this.getProducts().pipe(
            map(products => products.filter(p => p.bestSeller))
        );
    }
}
