import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map, catchError, of } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'customer';
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get all users (customers only)
   */
  getAllCustomers(): Observable<User[]> {
    return from(
      this.supabaseService.getClient()
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching customers:', error);
          return [];
        }
        if (!data || data.length === 0) {
          return [];
        }

        return data.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          is_active: user.is_active,
          created_at: user.created_at
        }));
      }),
      catchError((err) => {
        console.error('Error in getAllCustomers:', err);
        return of([]);
      })
    );
  }

  /**
   * Get all admins
   */
  getAllAdmins(): Observable<User[]> {
    return from(
      this.supabaseService.getClient()
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching admins:', error);
          return [];
        }
        if (!data || data.length === 0) {
          return [];
        }

        return data.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          is_active: user.is_active,
          created_at: user.created_at
        }));
      }),
      catchError((err) => {
        console.error('Error in getAllAdmins:', err);
        return of([]);
      })
    );
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<User | null> {
    return from(
      this.supabaseService.getClient()
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching user:', error);
          return null;
        }
        if (!data) return null;

        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone,
          address: data.address,
          is_active: data.is_active,
          created_at: data.created_at
        };
      }),
      catchError((err) => {
        console.error('Error in getUserById:', err);
        return of(null);
      })
    );
  }

  /**
   * Get total users count (customers only)
   */
  getTotalCustomersCount(): Observable<number> {
    return from(
      this.supabaseService.getClient()
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')
    ).pipe(
      map(({ count, error }) => {
        if (error) {
          console.error('Error fetching customers count:', error);
          return 0;
        }
        return count ?? 0;
      }),
      catchError((err) => {
        console.error('Error in getTotalCustomersCount:', err);
        return of(0);
      })
    );
  }

  /**
   * Get total users count (all roles)
   */
  getTotalUsersCount(): Observable<number> {
    return from(
      this.supabaseService.getClient()
        .from('profiles')
        .select('*', { count: 'exact', head: true })
    ).pipe(
      map(({ count, error }) => {
        if (error) {
          console.error('Error fetching total users:', error);
          return 0;
        }
        return count ?? 0;
      }),
      catchError((err) => {
        console.error('Error in getTotalUsersCount:', err);
        return of(0);
      })
    );
  }

  /**
   * Get active users count
   */
  getActiveUsersCount(): Observable<number> {
    return from(
      this.supabaseService.getClient()
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
    ).pipe(
      map(({ count, error }) => {
        if (error) {
          console.error('Error fetching active users:', error);
          return 0;
        }
        return count ?? 0;
      }),
      catchError((err) => {
        console.error('Error in getActiveUsersCount:', err);
        return of(0);
      })
    );
  }
}
