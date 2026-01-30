import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map, catchError, of } from 'rxjs';

export interface Seller {
  id: string;
  user_id: string;
  shop_name: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'active';
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get all sellers
   */
  getAllSellers(): Observable<Seller[]> {
    return from(
      this.supabaseService.getClient()
        .from('sellers')
        .select(`
          id,
          user_id,
          shop_name,
          description,
          status,
          profiles(
            full_name,
            email,
            phone,
            address
          ),
          created_at
        `)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching sellers:', error);
          return [];
        }
        if (!data || data.length === 0) {
          return [];
        }

        return data.map((seller: any) => {
          const profile = Array.isArray(seller.profiles) ? seller.profiles[0] : seller.profiles;
          return {
            id: seller.id,
            user_id: seller.user_id,
            shop_name: seller.shop_name,
            description: seller.description,
            status: seller.status,
            full_name: profile?.full_name || 'N/A',
            email: profile?.email || 'N/A',
            phone: profile?.phone,
            address: profile?.address,
            created_at: seller.created_at
          };
        });
      }),
      catchError((err) => {
        console.error('Error in getAllSellers:', err);
        return of([]);
      })
    );
  }

  /**
   * Get pending sellers (requests)
   */
  getPendingSellers(): Observable<Seller[]> {
    return from(
      this.supabaseService.getClient()
        .from('sellers')
        .select(`
          id,
          user_id,
          shop_name,
          description,
          status,
          profiles(
            full_name,
            email,
            phone,
            address
          ),
          created_at
        `)
        .eq('status', 'pending')
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching pending sellers:', error);
          return [];
        }
        if (!data || data.length === 0) {
          return [];
        }

        return data.map((seller: any) => {
          const profile = Array.isArray(seller.profiles) ? seller.profiles[0] : seller.profiles;
          return {
            id: seller.id,
            user_id: seller.user_id,
            shop_name: seller.shop_name,
            description: seller.description,
            status: seller.status,
            full_name: profile?.full_name || 'N/A',
            email: profile?.email || 'N/A',
            phone: profile?.phone,
            address: profile?.address,
            created_at: seller.created_at
          };
        });
      }),
      catchError((err) => {
        console.error('Error in getPendingSellers:', err);
        return of([]);
      })
    );
  }

  /**
   * Get approved sellers
   */
  getApprovedSellers(): Observable<Seller[]> {
    return from(
      this.supabaseService.getClient()
        .from('sellers')
        .select(`
          id,
          user_id,
          shop_name,
          description,
          status,
          profiles(
            full_name,
            email,
            phone,
            address
          ),
          created_at
        `)
        .eq('status', 'approved')
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching approved sellers:', error);
          return [];
        }
        if (!data || data.length === 0) {
          return [];
        }

        return data.map((seller: any) => {
          const profile = Array.isArray(seller.profiles) ? seller.profiles[0] : seller.profiles;
          return {
            id: seller.id,
            user_id: seller.user_id,
            shop_name: seller.shop_name,
            description: seller.description,
            status: seller.status,
            full_name: profile?.full_name || 'N/A',
            email: profile?.email || 'N/A',
            phone: profile?.phone,
            address: profile?.address,
            created_at: seller.created_at
          };
        });
      }),
      catchError((err) => {
        console.error('Error in getApprovedSellers:', err);
        return of([]);
      })
    );
  }

  /**
   * Get seller by ID
   */
  getSellerById(id: string): Observable<Seller | null> {
    return from(
      this.supabaseService.getClient()
        .from('sellers')
        .select(`
          id,
          user_id,
          shop_name,
          description,
          status,
          profiles(
            full_name,
            email,
            phone,
            address
          ),
          created_at
        `)
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching seller:', error);
          return null;
        }
        if (!data) return null;

        const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
        return {
          id: data.id,
          user_id: data.user_id,
          shop_name: data.shop_name,
          description: data.description,
          status: data.status,
          full_name: profile?.full_name || 'N/A',
          email: profile?.email || 'N/A',
          phone: profile?.phone,
          address: profile?.address,
          created_at: data.created_at
        };
      }),
      catchError((err) => {
        console.error('Error in getSellerById:', err);
        return of(null);
      })
    );
  }

  /**
   * Get total sellers count
   */
  getTotalSellersCount(): Observable<number> {
    return from(
      this.supabaseService.getClient()
        .from('sellers')
        .select('*', { count: 'exact', head: true })
    ).pipe(
      map(({ count, error }) => {
        if (error) {
          console.error('Error fetching sellers count:', error);
          return 0;
        }
        return count ?? 0;
      }),
      catchError((err) => {
        console.error('Error in getTotalSellersCount:', err);
        return of(0);
      })
    );
  }
}
