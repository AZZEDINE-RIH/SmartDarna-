import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError, tap, shareReplay } from 'rxjs';
import { Product } from '../../shared/product-card/product-card.component';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private dataUrl = '/assets/data/products.json';
    private productsCache$: Observable<Product[]> | null = null;

    constructor(private http: HttpClient) { }

    getProducts(): Observable<Product[]> {
        if (!this.productsCache$) {
            console.log('🔍 ProductService: Fetching products from:', this.dataUrl);
            this.productsCache$ = this.http.get<Product[]>(this.dataUrl).pipe(
                tap(products => {
                    console.log('✅ ProductService: Successfully loaded', products.length, 'products');
                    console.log('📦 ProductService: Product IDs:', products.map(p => p.id));
                }),
                shareReplay(1),
                catchError(error => {
                    this.productsCache$ = null; // Reset cache on error so we can retry
                    return this.handleError(error);
                })
            );
        }
        return this.productsCache$;
    }

    getProductById(id: string): Observable<Product | undefined> {
        console.log('🔍 ProductService: Getting product by ID:', id);
        return this.getProducts().pipe(
            map(products => {
                console.log('🔎 ProductService: Searching in', products.length, 'products for ID:', id);
                const found = products.find(p => String(p.id) === String(id));
                if (found) {
                    console.log('✅ ProductService: Product found:', found.name);
                } else {
                    console.warn('⚠️ ProductService: Product NOT FOUND for ID:', id);
                    console.log('📋 ProductService: Available IDs:', products.map(p => p.id).join(', '));
                }
                return found;
            }),
            catchError(this.handleError)
        );
    }

    getBestSellers(): Observable<Product[]> {
        return this.getProducts().pipe(
            map(products => {
                // Filter for best sellings
                const best = products.filter(p => p.bestSeller);
                // Return exactly 4 items (or less if not enough)
                return best.slice(0, 4);
            }),
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('❌ ProductService: HTTP Error occurred');
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error URL:', error.url);

        let errorMessage = 'An error occurred while fetching products.';

        if (error.status === 0) {
            // Client-side or network error
            console.error('🌐 Network error or CORS issue. The JSON file might not be accessible.');
            errorMessage = 'Network error. Please check if the server is running.';
        } else if (error.status === 404) {
            // 404 Not Found
            console.error('📁 File not found. The products.json file is not accessible at:', error.url);
            errorMessage = 'Products data file not found. Please check the assets configuration.';
        } else {
            // Server-side error
            console.error('🔴 Server error:', error.status, error.statusText);
            errorMessage = `Server error: ${error.status} ${error.statusText}`;
        }

        return throwError(() => new Error(errorMessage));
    }
}
