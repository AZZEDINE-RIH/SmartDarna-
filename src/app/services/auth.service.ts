import { Injectable } from '@angular/core';
import { AuthResponse, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export interface LoggedInUser {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  user_metadata?: any;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = new BehaviorSubject<User | null>(null);
  private supabase!: SupabaseClient;
  private lastRedirectedUserId: string | null = null;
  private cachedProfile: LoggedInUser | null = null;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {
    // IMPORTANT: reuse the singleton client to avoid multiple GoTrueClient instances
    this.supabase = this.supabaseService.getClient();

    // Mirror session -> user state, and do role-based redirect once per signed-in user
    this.supabaseService.getSession().subscribe((session) => {
      const currentUser = session?.user ?? null;
      this.user.next(currentUser);

      if (!currentUser) {
        this.lastRedirectedUserId = null;
        return;
      }

      if (this.lastRedirectedUserId === currentUser.id) {
        return;
      }

      // Mark this user as redirected to avoid duplicate redirects
      this.lastRedirectedUserId = currentUser.id;
      void this.redirectToUserDashboard();
    });
  }

  // Email/Password Sign Up
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const { email, password, name, role = 'user' } = data;

    const response = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });

    if (response.error) {
      throw response.error;
    }

    if (response.data.user) {
      await this.ensureProfileExists(response.data.user, { name, role });
    }

    return response;
  }

  // Email/Password Sign In
  async signIn(email: string, password: string): Promise<AuthResponse> {
    console.log('AuthService.signIn called with:', email);

    const response = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log('Supabase response:', response);

    if (response.error) {
      console.error('Supabase auth error:', response.error);
      throw response.error;
    }

    if (response.data.user) {
      await this.ensureProfileExists(response.data.user, {
        name: response.data.user.user_metadata?.['name'] || undefined,
        role: response.data.user.user_metadata?.['role'] || undefined
      });

      this.lastRedirectedUserId = response.data.user.id;
      void this.redirectToUserDashboard();
    }

    return response;
  }

  // GitHub OAuth (keep existing)
  async signInWithGithub() {
    await this.supabase.auth.signInWithOAuth({
      provider: 'github',
    });
  }

  // Sign Out
  async signOut() {
    // Immediately clear user state to prevent UI flash
    this.user.next(null);
    await this.supabase.auth.signOut();
  }

  get currentUser() {
    return this.user.asObservable();
  }

  // Legacy methods for compatibility
  isLoggedIn(): boolean {
    return this.user.value !== null;
  }

  async getUser(): Promise<LoggedInUser | null> {
    const currentUser = this.user.value;
    if (!currentUser) return null;

    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('role, name')
        .eq('id', currentUser.id)
        .single();

      const profileError = error as any;

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', profileError);
      }

      if ((!profile || profileError?.code === 'PGRST116') && !profileError?.message?.includes('permission denied')) {
        await this.ensureProfileExists(currentUser, {
          name: currentUser.user_metadata?.['name'] || undefined,
          role: currentUser.user_metadata?.['role'] || undefined
        });
      }

      const resolved: LoggedInUser = {
        id: currentUser.id,
        email: currentUser.email || '',
        name: profile?.name || currentUser.user_metadata?.['name'] || currentUser.email || 'User',
        role: profile?.role || currentUser.user_metadata?.['role'] || 'user',
        user_metadata: currentUser.user_metadata
      };
      this.cachedProfile = resolved;
      return resolved;
    } catch (error) {
      console.error('Error in getUser:', error);
      const fallback: LoggedInUser = {
        id: currentUser.id,
        email: currentUser.email || '',
        name: currentUser.user_metadata?.['name'] || currentUser.email || 'User',
        role: currentUser.user_metadata?.['role'] || 'user',
        user_metadata: currentUser.user_metadata
      };
      this.cachedProfile = fallback;
      return fallback;
    }
  }

  getUserSync(): LoggedInUser | null {
    const currentUser = this.user.value;
    if (!currentUser) return null;

    if (this.cachedProfile && this.cachedProfile.id === currentUser.id) {
      return this.cachedProfile;
    }

    return {
      id: currentUser.id,
      email: currentUser.email || '',
      name: currentUser.user_metadata?.['name'] || currentUser.email || 'User',
      role: currentUser.user_metadata?.['role'] || 'user',
      user_metadata: currentUser.user_metadata
    };
  }

  private async ensureProfileExists(
    user: User,
    data?: { name?: string; role?: string }
  ): Promise<void> {
    try {
      await this.supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email || null,
            name: data?.name ?? user.user_metadata?.['name'] ?? user.email ?? 'User',
            role: data?.role ?? user.user_metadata?.['role'] ?? 'user'
          },
          { onConflict: 'id' }
        );
    } catch (e) {
      console.error('Error ensuring profile exists:', e);
    }
  }

  // Role-based redirect method
  async redirectToUserDashboard(): Promise<void> {
    try {
      const userProfile = await this.getUser();
      const userRole = userProfile?.role || 'user';

      console.log('Redirecting user with role:', userRole);

      switch (userRole) {
        case 'admin':
          this.router.navigate(['/dashboard/overview']);
          break;
        case 'seller':
          this.router.navigate(['/user/dashboard']);
          break;
        case 'user':
          this.router.navigate(['/home']);
          break;
        default:
          this.router.navigate(['/home']);
      }
    } catch (error) {
      console.error('Error in role-based redirect:', error);
      this.router.navigate(['/home']);
    }
  }

  logout(): void {
    this.signOut();
  }
}
