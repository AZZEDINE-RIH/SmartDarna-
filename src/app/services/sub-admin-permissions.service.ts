import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService, LoggedInUser } from './auth.service';

export const ADMIN_PERMISSION_KEYS = [
  'manage_products',
  'manage_users',
  'manage_sellers',
  'manage_orders',
  'view_analytics',
  'manage_settings',
  'manage_settings_general',
  'manage_feature_flags',
  'view_audit_log'
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSION_KEYS)[number];

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
}

const DEFAULT_SUPER_ADMIN_EMAILS = new Set<string>(['sarajamal02@gmail.com']);

@Injectable({
  providedIn: 'root'
})
export class SubAdminPermissionsService {
  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  async isSuperAdmin(user?: LoggedInUser | null): Promise<boolean> {
    const u = user ?? (await this.authService.getUser());
    const email = (u?.email || '').toLowerCase();
    if (!u) return false;
    if (DEFAULT_SUPER_ADMIN_EMAILS.has(email)) return true;

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('super_admins')
        .select('user_id')
        .eq('user_id', u.id)
        .single();

      const e: any = error;
      if (e && e.code === 'PGRST116') {
        return false;
      }

      if (error) {
        return false;
      }

      return !!data?.user_id;
    } catch {
      return false;
    }
  }

  async getMyPermissions(): Promise<AdminPermission[]> {
    const me = await this.authService.getUser();
    if (!me) return [];

    if (await this.isSuperAdmin(me)) {
      return [...ADMIN_PERMISSION_KEYS];
    }

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('sub_admin_permissions')
        .select('permission')
        .eq('admin_id', me.id);

      if (error) {
        return [];
      }

      const perms = (data || [])
        .map((row: any) => row?.permission)
        .filter(Boolean) as AdminPermission[];

      return perms;
    } catch {
      return [];
    }
  }

  async hasPermission(permission: AdminPermission): Promise<boolean> {
    const perms = await this.getMyPermissions();
    return perms.includes(permission);
  }

  async listAdminUsers(): Promise<AdminUserSummary[]> {
    const client = this.supabaseService.getClient();

    const runQuery = async (selectCols: string, withOrder: boolean) => {
      let q: any = client
        .from('profiles')
        .select(selectCols)
        .eq('role', 'admin');

      if (withOrder) {
        q = q.order('created_at', { ascending: false });
      }

      return q;
    };

    const attempts: Array<{ selectCols: string; withOrder: boolean }> = [
      { selectCols: 'id,name,full_name,email,role,created_at', withOrder: true },
      { selectCols: 'id,name,email,role,created_at', withOrder: true },
      { selectCols: 'id,name,email,role', withOrder: false },
    ];

    let lastError: any = null;

    for (const a of attempts) {
      const { data, error } = await runQuery(a.selectCols, a.withOrder);
      if (error) {
        lastError = error;
        continue;
      }

      return (data || [])
        .map((row: any) => ({
          id: row.id,
          name: row.name || row.full_name || row.email || 'Admin',
          email: row.email || ''
        }))
        .filter((u: AdminUserSummary) => !!u.id);
    }

    throw lastError || new Error('Failed to load admin users');
  }

  async getPermissionsForAdmin(adminId: string): Promise<Set<AdminPermission>> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('sub_admin_permissions')
        .select('permission')
        .eq('admin_id', adminId);

      if (error) {
        return new Set<AdminPermission>();
      }

      const perms = (data || [])
        .map((row: any) => row?.permission)
        .filter(Boolean) as AdminPermission[];

      return new Set<AdminPermission>(perms);
    } catch {
      return new Set<AdminPermission>();
    }
  }

  async grantPermission(adminId: string, permission: AdminPermission): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('sub_admin_permissions')
      .upsert({ admin_id: adminId, permission }, { onConflict: 'admin_id,permission' });

    if (error) {
      throw error;
    }
  }

  async revokePermission(adminId: string, permission: AdminPermission): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('sub_admin_permissions')
      .delete()
      .eq('admin_id', adminId)
      .eq('permission', permission);

    if (error) {
      throw error;
    }
  }
}
