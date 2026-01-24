import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoggedInUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'vendeur' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseAuthService {
  private supabaseService = inject(SupabaseService);
  private currentUser$ = new BehaviorSubject<LoggedInUser | null>(null);
  private readonly STORAGE_KEY = 'currentSupabaseUser';

  constructor() {
    this.initAuthState();
  }

  /**
   * Initialize auth state from Supabase
   */
  private initAuthState() {
    this.supabaseService.getAuthState().subscribe(async (user) => {
      if (user) {
        await this.loadUserProfile(user.id);
      } else {
        this.currentUser$.next(null);
        this.clearUserStorage();
      }
    });
  }

  /**
   * Load user profile from users table
   */
  private async loadUserProfile(userId: string) {
    const { data, error } = await this.supabaseService.getUserById(userId);
    if (data && !error) {
      const loggedInUser: LoggedInUser = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role || 'user'
      };
      this.currentUser$.next(loggedInUser);
      this.storeUserLocally(loggedInUser);
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, name: string, role: 'user' | 'vendeur' = 'user') {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await this.supabaseService.signUp(email, password);
      
      if (authError) {
        console.error('Auth signup error:', authError);
        return { success: false, error: authError };
      }

      if (authData.user) {
        // Create user profile in profiles table
        const { data: userData, error: userError } = await this.supabaseService.createUser({
          id: authData.user.id,
          email: email,
          name: name,
          role: role,
          created_at: new Date().toISOString()
        });

        if (userError) {
          console.error('User profile creation error:', userError);
          return { success: false, error: userError };
        }

        return { success: true, data: userData };
      }

      return { success: false, error: 'Unknown error' };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabaseService.signIn(email, password);
      
      if (error) {
        console.error('Sign in error:', error);
        return { success: false, error };
      }

      if (data.user) {
        await this.loadUserProfile(data.user.id);
        return { success: true, data };
      }

      return { success: false, error: 'Unknown error' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error };
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      const { error } = await this.supabaseService.signOut();
      if (error) {
        console.error('Sign out error:', error);
        return { success: false, error };
      }
      this.currentUser$.next(null);
      this.clearUserStorage();
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error };
    }
  }

  /**
   * Get current user observable
   */
  getCurrentUser(): Observable<LoggedInUser | null> {
    return this.currentUser$.asObservable();
  }

  /**
   * Get current user value
   */
  getCurrentUserValue(): LoggedInUser | null {
    return this.currentUser$.getValue();
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.currentUser$.getValue() !== null;
  }

  /**
   * Get user role
   */
  getUserRole(): string | null {
    return this.currentUser$.getValue()?.role || null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<LoggedInUser>) {
    const currentUser = this.currentUser$.getValue();
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    const { data, error } = await this.supabaseService.updateUser(currentUser.id, updates);
    
    if (error) {
      console.error('Update profile error:', error);
      return { success: false, error };
    }

    // Update local state
    const updatedUser = { ...currentUser, ...updates };
    this.currentUser$.next(updatedUser);
    this.storeUserLocally(updatedUser);

    return { success: true, data };
  }

  /**
   * Store user locally
   */
  private storeUserLocally(user: LoggedInUser) {
    if (this.isBrowser()) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }
  }

  /**
   * Clear user storage
   */
  private clearUserStorage() {
    if (this.isBrowser()) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Check if running in browser
   */
  private isBrowser(): boolean {
    return typeof localStorage !== 'undefined' && typeof window !== 'undefined';
  }
}
