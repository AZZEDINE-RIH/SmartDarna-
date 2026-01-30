import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private authState$ = new BehaviorSubject<Session | null>(null);
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private authListenerRegistered = false;
  private initRetryCount = 0;
  private readonly maxInitRetries = 5;

  constructor() {
    // Check if running in browser environment
    const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey,
      {
        auth: {
          persistSession: isBrowser,
          autoRefreshToken: isBrowser,
          detectSessionInUrl: isBrowser,
          storage: isBrowser ? localStorage : undefined
        }
      }
    );
    
    if (isBrowser) {
      void this.initializeAuth().catch((error: any) => {
        const isAbort = error?.name === 'AbortError' || `${error?.message || ''}`.includes('signal is aborted');
        if (isAbort) {
          if (this.initRetryCount < this.maxInitRetries) {
            this.initRetryCount += 1;
            const delayMs = 250 * this.initRetryCount;
            console.warn(`Auth initialization aborted (retry ${this.initRetryCount}/${this.maxInitRetries})`);
            this.initPromise = null;
            setTimeout(() => {
              void this.initializeAuth();
            }, delayMs);
          }
          return;
        }

        console.error('Error initializing auth:', error);
      });
    }
  }

  // Initialize authentication state
  private async initializeAuth() {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.initializeAuthInternal();
    return this.initPromise;
  }

  private async initializeAuthInternal() {
    if (this.isInitialized) return;
    let aborted = false;
    
    try {
      if (!this.authListenerRegistered) {
        // Listen for auth changes (set this up early)
        this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
          console.log('🔍 Auth state changed:', event, session?.user?.id);
          this.authState$.next(session);
        });
        this.authListenerRegistered = true;
      }

      // Wait for initial session
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) {
        console.error('Error getting initial session:', error);
      }
      
      console.log('🔍 Initial session:', session?.user?.id);
      this.authState$.next(session);
    } catch (error: any) {
      // Supabase uses a lock when accessing storage; in SSR hydration / fast reload this can abort.
      // This is usually transient and safe to retry.
      if (error?.name === 'AbortError') {
        aborted = true;
        if (this.initRetryCount < this.maxInitRetries) {
          this.initRetryCount += 1;
          const delayMs = 250 * this.initRetryCount;
          console.warn(`Auth initialization aborted (retry ${this.initRetryCount}/${this.maxInitRetries})`);
          this.initPromise = null;
          setTimeout(() => {
            void this.initializeAuth();
          }, delayMs);
        }
        return;
      }

      console.error('Error initializing auth:', error);
    } finally {
      if (!aborted) {
        this.initRetryCount = 0;
        this.isInitialized = true;
      }
    }
  }

  // Get session observable (emits only when session exists)
  getSession(): Observable<Session | null> {
    return this.authState$.asObservable();
  }

  // Get authenticated session (waits for valid session)
  getAuthenticatedSession(): Observable<Session> {
    return this.authState$.pipe(
      filter((session): session is Session => session !== null && !!session.user),
      map(session => session as Session)
    );
  }

  // Get current session synchronously
  getCurrentSession(): Session | null {
    return this.authState$.getValue();
  }

  // Get Supabase client
  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const session = this.authState$.getValue();
    return session !== null && !!session.user;
  }

  // Tables operations - Profiles (User data)
  async getProfiles() {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*');
    if (error) console.error('Error fetching profiles:', error);
    return { data, error };
  }

  async getProfileById(id: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) console.error('Error fetching profile:', error);
    return { data, error };
  }

  async createProfile(profile: any) {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert([profile])
      .select();
    if (error) console.error('Error creating profile:', error);
    return { data, error };
  }

  async updateProfile(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) console.error('Error updating profile:', error);
    return { data, error };
  }

  async deleteProfile(id: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) console.error('Error deleting profile:', error);
    return { data, error };
  }

  // Alias methods for backward compatibility
  async getUsers() {
    return this.getProfiles();
  }

  async getUserById(id: string) {
    return this.getProfileById(id);
  }

  async createUser(user: any) {
    return this.createProfile(user);
  }

  async updateUser(id: string, updates: any) {
    return this.updateProfile(id, updates);
  }

  async deleteUser(id: string) {
    return this.deleteProfile(id);
  }

  // Tables operations - Products
  async getProducts() {
    const { data, error } = await this.supabase
      .from('products')
      .select('*');
    if (error) console.error('Error fetching products:', error);
    return { data, error };
  }

  async getProductById(id: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) console.error('Error fetching product:', error);
    return { data, error };
  }

  async createProduct(product: any) {
    const { data, error } = await this.supabase
      .from('products')
      .insert([product])
      .select();
    if (error) console.error('Error creating product:', error);
    return { data, error };
  }

  async updateProduct(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) console.error('Error updating product:', error);
    return { data, error };
  }

  async deleteProduct(id: string) {
    const { data, error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) console.error('Error deleting product:', error);
    return { data, error };
  }

  // Tables operations - Orders
  async getOrders() {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*');
    if (error) console.error('Error fetching orders:', error);
    return { data, error };
  }

  async getOrderById(id: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error) console.error('Error fetching order:', error);
    return { data, error };
  }

  async createOrder(order: any) {
    const { data, error } = await this.supabase
      .from('orders')
      .insert([order])
      .select();
    if (error) console.error('Error creating order:', error);
    return { data, error };
  }

  async updateOrder(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) console.error('Error updating order:', error);
    return { data, error };
  }

  async deleteOrder(id: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .delete()
      .eq('id', id);
    if (error) console.error('Error deleting order:', error);
    return { data, error };
  }

  // Authentication operations
  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });
    if (error) console.error('Error signing up:', error);
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) console.error('Error signing in:', error);
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
    return { error };
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) console.error('Error getting current user:', error);
    return { user, error };
  }

  // Generic query method for custom queries
  async query(table: string, operation: 'select' | 'insert' | 'update' | 'delete', data?: any, filters?: any) {
    let queryBuilder = this.supabase.from(table);
    let result;

    switch (operation) {
      case 'select':
        result = await queryBuilder.select(data?.columns || '*');
        break;
      case 'insert':
        result = await queryBuilder.insert([data]).select();
        break;
      case 'update':
        result = await queryBuilder.update(data).eq(Object.keys(filters || {})[0], Object.values(filters || {})[0]).select();
        break;
      case 'delete':
        result = await queryBuilder.delete().eq(Object.keys(filters || {})[0], Object.values(filters || {})[0]);
        break;
    }

    if (result.error) console.error(`Error in ${operation}:`, result.error);
    return result;
  }
}
