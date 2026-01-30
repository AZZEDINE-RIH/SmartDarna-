import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';
import { Session } from '@supabase/supabase-js';

export interface LoggedInUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'seller' | 'admin';
  phone?: string;
  address?: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseAuthService {
  private supabaseService = inject(SupabaseService);
  public currentUser$ = new BehaviorSubject<LoggedInUser | null>(null);
  private readonly STORAGE_KEY = 'currentSupabaseUser';

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication - listen for authenticated sessions only
   */
  private initializeAuth() {
    this.supabaseService.getAuthenticatedSession().pipe(
      switchMap(async (session: Session) => {
        console.log('🔍 Authenticated session detected:', session.user.id);
        await this.loadUserProfile(session.user.id, session.user.email);
      })
    ).subscribe({
      error: (error) => {
        console.error('🔍 Error in auth initialization:', error);
      }
    });
  }

  /**
   * Load user profile only when we have a valid session
   */
  private async loadUserProfile(userId: string, userEmail?: string): Promise<void> {
    console.log('🔍 Loading profile for userId:', userId);
    console.log('🔍 User email:', userEmail);
    
    // Double-check we have a session before querying
    const currentSession = this.supabaseService.getCurrentSession();
    if (!currentSession) {
      console.error('🔍 No session when trying to load profile');
      this.currentUser$.next(null);
      return;
    }
    
    console.log('🔍 Session verified, querying profiles...');
    
    // Query profile with authenticated client
    const { data: profileData, error: profileError } = await this.supabaseService.getProfileById(userId);
    
    console.log('🔍 Profile query result:', { profileData, profileError });
    
    if (profileData && !profileError) {
      console.log('🔍 Profile loaded successfully:', profileData);
      
      // Check if user is active
      if (!profileData.is_active) {
        console.warn('User account is inactive:', userId);
        await this.signOut();
        return;
      }

      const normalizedRole: LoggedInUser['role'] = this.normalizeRole(profileData.role);
      
      console.log('🔍 Normalized role:', normalizedRole);
      
      const loggedInUser: LoggedInUser = {
        id: profileData.id,
        email: userEmail || '',
        name: profileData.name,
        role: normalizedRole,
        phone: profileData.phone || undefined,
        address: profileData.address || undefined,
        is_active: profileData.is_active
      };
      
      console.log('🔍 Setting current user:', loggedInUser);
      this.currentUser$.next(loggedInUser);
      this.storeUserLocally(loggedInUser);
    } else {
      console.error('🔍 Error loading user profile:', profileError);
      // Don't set fallback user - profile must be loaded to proceed
      this.currentUser$.next(null);
      this.clearUserStorage();
      console.error('🔍 ⚠️ Profile fetch failed - RLS policies may be blocking access. Check Supabase RLS settings.');
    }
  }

  /**
   * Normalize role to ensure valid values
   */
  private normalizeRole(role: string): LoggedInUser['role'] {
    switch (role?.toLowerCase()) {
      case 'admin': return 'admin';
      case 'seller': return 'seller';
      case 'customer': return 'user';
      case 'user': return 'user';
      default: return 'user';
    }
  }

  /**
   * Sign in with proper session handling
   */
  async signIn(email: string, password: string) {
    try {
      console.log('🔍 Attempting sign in for:', email);
      const { data, error } = await this.supabaseService.signIn(email, password);
      
      if (error) {
        console.error('Sign in error:', error);
        return { success: false, error };
      }

      if (data.user && data.session) {
        console.log('🔍 Sign in successful, waiting for profile load...');
        
        // Wait for profile to be loaded by the auth listener
        await this.waitForProfileLoad();
        
        return { success: true, data };
      }

      return { success: false, error: 'Unknown error' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error };
    }
  }

  /**
   * Wait for user profile to be loaded
   */
  private async waitForProfileLoad(timeout = 3000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const currentUser = this.currentUser$.getValue();
      if (currentUser) {
        console.log('🔍 Profile/user loaded:', currentUser.role || 'default');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.warn('🔍 Timeout waiting for profile to load (may be due to RLS policy restrictions)');
  }

  /**
   * Sign up with profile creation
   */
  async signUp(email: string, password: string, name: string, phone?: string, address?: string, role?: string) {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await this.supabaseService.signUp(email, password);
      
      if (authError) {
        console.error('Auth signup error:', authError);
        return { success: false, error: authError };
      }

      if (authData.user) {
        // Create user profile in profiles table
        const { data: userData, error: userError } = await this.supabaseService.createProfile({
          id: authData.user.id,
          name: name,
          role: role || 'user', // Use provided role or default to 'user'
          phone: phone || null,
          address: address || null,
          is_active: true,
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
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
