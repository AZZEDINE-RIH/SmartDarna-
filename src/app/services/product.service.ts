import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map, catchError, of } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  category_id: string | null;
  category_name?: string;
  seller_id: string | null;
  seller_name?: string;
  image_url: string | null;
  status: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get all products with category details
   */
  getAllProducts(): Observable<Product[]> {
    return from(
      this.supabaseService.getClient()
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          stock_quantity,
          category_id,
          categories(name),
          seller_id,
          sellers(shop_name),
          image_url,
          status,
          created_at
        `)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching products:', error);
          return [];
        }
        if (!data || data.length === 0) {
          return [];
        }

        return data.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock_quantity: product.stock_quantity,
          category_id: product.category_id,
          category_name: (product.categories as any)?.name || 'Uncategorized',
          seller_id: product.seller_id,
          seller_name: (product.sellers as any)?.shop_name || 'Unknown',
          image_url: product.image_url,
          status: product.status,
          created_at: product.created_at
        }));
      }),
      catchError((err) => {
        console.error('Error in getAllProducts:', err);
        return of([]);
      })
    );
  }

  /**
   * Get product by ID
   */
  getProductById(id: string): Observable<Product | null> {
    return from(
      this.supabaseService.getClient()
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          stock_quantity,
          category_id,
          categories(name),
          seller_id,
          sellers(shop_name),
          image_url,
          status,
          created_at
        `)
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching product:', error);
          return null;
        }
        if (!data) return null;

        return {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          stock_quantity: data.stock_quantity,
          category_id: data.category_id,
          category_name: (data.categories as any)?.name || 'Uncategorized',
          seller_id: data.seller_id,
          seller_name: (data.sellers as any)?.shop_name || 'Unknown',
          image_url: data.image_url,
          status: data.status,
          created_at: data.created_at
        };
      }),
      catchError((err) => {
        console.error('Error in getProductById:', err);
        return of(null);
      })
    );
  }

  /**
   * Get products by category
   */
  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return from(
      this.supabaseService.getClient()
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          stock_quantity,
          category_id,
          categories(name),
          seller_id,
          sellers(shop_name),
          image_url,
          status,
          created_at
        `)
        .eq('category_id', categoryId)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching products by category:', error);
          return [];
        }
        if (!data || data.length === 0) {
          return [];
        }

        return data.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock_quantity: product.stock_quantity,
          category_id: product.category_id,
          category_name: product.categories?.name || 'Uncategorized',
          seller_id: product.seller_id,
          seller_name: product.sellers?.shop_name || 'Unknown',
          image_url: product.image_url,
          status: product.status,
          created_at: product.created_at
        }));
      }),
      catchError((err) => {
        console.error('Error in getProductsByCategory:', err);
        return of([]);
      })
    );
  }

  /**
   * Get total product count
   */
  getTotalProductCount(): Observable<number> {
    return from(
      this.supabaseService.getClient()
        .from('products')
        .select('*', { count: 'exact', head: true })
    ).pipe(
      map(({ count, error }) => {
        if (error) {
          console.error('Error fetching product count:', error);
          return 0;
        }
        return count ?? 0;
      }),
      catchError((err) => {
        console.error('Error in getTotalProductCount:', err);
        return of(0);
      })
    );
  }
}
