import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Product } from '../../shared/product-card/product-card.component';
import { SupabaseService } from '../../services/supabase.service';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    // Fallback image for products without photos
    private readonly FALLBACK_IMAGE = 'https://via.placeholder.com/400x400?text=No+Image';

    constructor(private supabaseService: SupabaseService) { }

    /**
     * Fetch all products from Supabase
     */
    getProducts(): Observable<Product[]> {
        console.log('📦 ProductService: Fetching products from Supabase...');
        return from(this.supabaseService.getProducts()).pipe(
            map(({ data, error }) => {
                console.log('🔍 ProductService: RAW Supabase response:', { data, error });
                console.log('🔍 ProductService: Data type:', typeof data);
                console.log('🔍 ProductService: Is array?:', Array.isArray(data));
                console.log('🔍 ProductService: Data length:', data?.length);

                if (error) {
                    console.error('❌ ProductService: Error fetching products:', error);
                    throw error;
                }

                if (!data) {
                    console.warn('⚠️ ProductService: No data returned from Supabase');
                    return [];
                }

                console.log('✅ ProductService: Successfully fetched', data.length, 'products');
                console.log('📋 ProductService: Products data:', data);

                const mappedProducts = this.mapSupabaseProducts(data);
                console.log('📋 ProductService: Mapped products:', mappedProducts);

                return mappedProducts;
            }),
            catchError(error => {
                console.error('❌ ProductService: Failed to fetch products:', error);
                return of([]);
            })
        );
    }

    /**
     * Fetch a single product by ID
     */
    getProductById(id: string): Observable<Product | undefined> {
        console.log('🔍 ProductService: Fetching product by ID:', id);
        return from(this.supabaseService.getProductById(id)).pipe(
            map(({ data, error }) => {
                if (error) {
                    console.error('❌ ProductService: Error fetching product:', error);
                    return undefined;
                }

                if (!data) {
                    console.warn('⚠️ ProductService: Product not found for ID:', id);
                    return undefined;
                }

                console.log('✅ ProductService: Found product:', data.name);
                return this.mapSupabaseProduct(data);
            }),
            catchError(error => {
                console.error('❌ ProductService: Failed to fetch product:', error);
                return of(undefined);
            })
        );
    }

    /**
     * Fetch best seller products
     * Returns the first 3 products from the database
     */
    getBestSellers(): Observable<Product[]> {
        console.log('🌟 ProductService: Fetching best sellers...');
        return this.getProducts().pipe(
            map(products => {
                // Get the first 3 products
                const bestSellers = products.slice(0, 3);

                console.log('✅ ProductService: Found', bestSellers.length, 'best sellers');
                return bestSellers;
            })
        );
    }

    /**
     * Map Supabase product data to our Product interface
     */
    private mapSupabaseProducts(supabaseProducts: any[]): Product[] {
        return supabaseProducts.map(p => this.mapSupabaseProduct(p));
    }

    /**
     * Map a single Supabase product to our Product interface
     * Handles missing images with fallback
     */
    private mapSupabaseProduct(supabaseProduct: any): Product {
        // Parse images - handle various formats (string, array, null)
        let images: string[] = [];
        if (supabaseProduct.images) {
            if (typeof supabaseProduct.images === 'string') {
                try {
                    images = JSON.parse(supabaseProduct.images);
                } catch {
                    images = [supabaseProduct.images];
                }
            } else if (Array.isArray(supabaseProduct.images)) {
                images = supabaseProduct.images;
            }
        }

        // Use fallback image if no images are available
        if (images.length === 0) {
            images = [this.FALLBACK_IMAGE];
        }

        // Parse colors - handle various formats
        let colors: string[] = [];
        if (supabaseProduct.colors) {
            if (typeof supabaseProduct.colors === 'string') {
                try {
                    colors = JSON.parse(supabaseProduct.colors);
                } catch {
                    colors = [supabaseProduct.colors];
                }
            } else if (Array.isArray(supabaseProduct.colors)) {
                colors = supabaseProduct.colors;
            }
        }

        // Default to a single color if none provided
        if (colors.length === 0) {
            colors = ['default'];
        }

        return {
            id: supabaseProduct.id,
            name: supabaseProduct.name || 'Unnamed Product',
            price: supabaseProduct.price || 0,
            rating: supabaseProduct.rating || 0,
            reviews: supabaseProduct.reviews || 0,
            images: images,
            colors: colors,
            category: supabaseProduct.category || 'Uncategorized',
            brand: supabaseProduct.brand || 'Unknown',
            stock: supabaseProduct.stock || 0,
            bestSeller: supabaseProduct.best_seller || false,
            description: supabaseProduct.description || ''
        };
    }
}
