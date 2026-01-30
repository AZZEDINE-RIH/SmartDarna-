import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable } from 'rxjs';

export interface Profile {
  id: string;
  name: string;
  role: 'user' | 'seller' | 'admin';
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<{ data: Profile | null; error: any }> {
    return this.supabaseService.getProfileById(userId);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ data: Profile | null; error: any }> {
    const result = await this.supabaseService.updateProfile(userId, updates);
    return {
      data: result.data as unknown as Profile || null,
      error: result.error
    };
  }

  /**
   * Get all profiles (admin only)
   */
  async getAllProfiles(): Promise<{ data: Profile[] | null; error: any }> {
    const result = await this.supabaseService.getProfiles();
    return {
      data: result.data as unknown as Profile[] || null,
      error: result.error
    };
  }

  /**
   * Deactivate user (admin only)
   */
  async deactivateUser(userId: string): Promise<{ data: any; error: any }> {
    return this.supabaseService.updateProfile(userId, { is_active: false });
  }

  /**
   * Activate user (admin only)
   */
  async activateUser(userId: string): Promise<{ data: any; error: any }> {
    return this.supabaseService.updateProfile(userId, { is_active: true });
  }

  /**
   * Change user role (admin only)
   */
  async changeUserRole(userId: string, role: 'user' | 'seller' | 'admin'): Promise<{ data: any; error: any }> {
    return this.supabaseService.updateProfile(userId, { role });
  }
}
