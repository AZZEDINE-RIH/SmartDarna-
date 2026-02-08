import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map, catchError, of } from 'rxjs';

export interface Seller {
  id: string;
  email: string;
  name: string;
  role: 'seller';
  shop_name?: string;
  phone?: string;
  address?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  constructor(private supabaseService: SupabaseService) { }

  async createSellerAccount(
    email: string,
    password: string,
    name: string,
    shop_name: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Save current admin session
      const { data: { session: adminSession } } = await this.supabaseService.getClient().auth.getSession();

      if (!adminSession) {
        return { success: false, message: 'You must be logged in as admin to create seller accounts' };
      }

      // Create auth user with seller role
      const { data: authData, error: authError } = await this.supabaseService.getClient().auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'seller',
            shop_name
          }
        }
      });

      if (authError) {
        console.error('Error creating seller auth account:', authError);
        // Restore admin session
        await this.supabaseService.getClient().auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token
        });
        return { success: false, message: authError.message };
      }

      if (!authData.user) {
        // Restore admin session
        await this.supabaseService.getClient().auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token
        });
        return { success: false, message: 'User creation failed - no user returned' };
      }

      // Create/update profile with seller role
      const { error: profileError } = await this.supabaseService.getClient()
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email,
          name,
          role: 'seller',
          shop_name,
          status: 'active'
        }, { onConflict: 'id' });

      // Restore admin session immediately after creating the seller
      await this.supabaseService.getClient().auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token
      });

      if (profileError) {
        console.error('Error creating seller profile:', profileError);
        return { success: false, message: profileError.message };
      }

      return { success: true, message: 'Seller account created successfully' };
    } catch (error: any) {
      console.error('Error in createSellerAccount:', error);
      return { success: false, message: error?.message || 'An unexpected error occurred' };
    }
  }

  // Legacy createSeller method for compatibility
  createSeller(input: {
    name: string;
    email: string;
    shop_name: string;
  }): Observable<{ success: boolean; message: string }> {
    // This method is deprecated - use createSellerAccount instead
    return from(
      this.createSellerAccount(input.email, 'TempPassword123!', input.name, input.shop_name)
    ).pipe(
      map(result => result),
      catchError(err => {
        console.error('Error in createSeller:', err);
        return of({ success: false, message: err?.message || 'Unknown error' });
      })
    );
  }

  updateSellerDetails(
    sellerId: string,
    patch: { shop_name?: string }
  ): Observable<boolean> {
    return from(
      this.supabaseService.getClient()
        .from('sellers')
        .update({
          ...(patch.shop_name !== undefined ? { shop_name: patch.shop_name } : {})
        })
        .eq('id', sellerId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error updating seller details:', error);
          return false;
        }
        return true;
      }),
      catchError((err) => {
        console.error('Error in updateSellerDetails:', err);
        return of(false);
      })
    );
  }

  /**
   * Get all sellers from profiles table where role='seller'
   */
  getAllSellers(): Observable<Seller[]> {
    return from(
      this.supabaseService.getClient()
        .from('profiles')
        .select('*')
        .eq('role', 'seller')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching sellers:', error);
          return [];
        }
        if (!data || data.length === 0) {
          return [];
        }

        // Data is already in the correct format from profiles table
        return data.map((profile: any) => ({
          id: profile.id,
          email: profile.email || '',
          name: profile.name || 'N/A',
          role: 'seller' as const,
          shop_name: profile.shop_name,
          phone: profile.phone,
          address: profile.address,
          status: profile.status || 'active',
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }));
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
        .from('profiles')
        .select('*')
        .eq('role', 'seller')
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

        return data.map((profile: any) => ({
          id: profile.id,
          email: profile.email || '',
          name: profile.name || 'N/A',
          role: 'seller' as const,
          shop_name: profile.shop_name,
          phone: profile.phone,
          address: profile.address,
          status: profile.status || 'pending',
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }));
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
        .from('profiles')
        .select('*')
        .eq('role', 'seller')
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

        return data.map((profile: any) => ({
          id: profile.id,
          email: profile.email || '',
          name: profile.name || 'N/A',
          role: 'seller' as const,
          shop_name: profile.shop_name,
          phone: profile.phone,
          address: profile.address,
          status: profile.status || 'approved',
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }));
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
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('role', 'seller')
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching seller by ID:', error);
          return null;
        }
        if (!data) return null;

        return {
          id: data.id,
          email: data.email || '',
          name: data.name || 'N/A',
          role: 'seller' as const,
          shop_name: data.shop_name,
          phone: data.phone,
          address: data.address,
          status: data.status || 'active',
          created_at: data.created_at,
          updated_at: data.updated_at
        };
      }),
      catchError((err) => {
        console.error('Error in getSellerById:', err);
        return of(null);
      })
    );
  }

  updateSellerStatus(sellerId: string, status: Seller['status']): Observable<boolean> {
    return from(
      this.supabaseService.getClient()
        .from('sellers')
        .update({ status })
        .eq('id', sellerId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error updating seller status:', error);
          return false;
        }
        return true;
      }),
      catchError((err) => {
        console.error('Error in updateSellerStatus:', err);
        return of(false);
      })
    );
  }

  /**
   * Delete a seller
   */
  deleteSeller(sellerId: string): Observable<boolean> {
    return from(
      this.supabaseService.getClient()
        .from('sellers')
        .delete()
        .eq('id', sellerId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error deleting seller:', error);
          return false;
        }
        return true;
      }),
      catchError((err) => {
        console.error('Error in deleteSeller:', err);
        return of(false);
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
