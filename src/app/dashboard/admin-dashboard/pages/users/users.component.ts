import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { SupabaseService } from '../../../../services/supabase.service';
import { ADMIN_PERMISSION_KEYS, AdminPermission, AdminUserSummary, SubAdminPermissionsService } from '../../../../services/sub-admin-permissions.service';



interface User {

  id: string;

  name: string;

  email: string;

  role: string;

  is_active: boolean;

  created_at: string;

}

interface SuperAdminRow {
  user_id: string;
}



@Component({

  selector: 'app-users-page',

  standalone: true,

  imports: [CommonModule],

  template: `

    <div class="page-container" *ngIf="!isLoading; else loadingTemplate">

      <div class="page-header">

        <h1>Users Management</h1>

        <p>Manage customer accounts, permissions, and activity</p>

      </div>

      <div class="content-card" *ngIf="isSuperAdmin">

        <div class="card-header">

          <h3>Sub Admin Permissions</h3>

          <div class="header-actions">

            <span class="meta" *ngIf="isLoadingSubAdmins">Loading...</span>

            <span class="meta error" *ngIf="subAdminsError">{{ subAdminsError }}</span>

            <button

              class="btn-secondary"

              *ngIf="selectedSubAdmin"

              (click)="cancelPermissionChanges()"

              [disabled]="isSavingPermission || !hasPermissionChanges()"

            >Cancel</button>

            <button

              class="btn-primary"

              *ngIf="selectedSubAdmin"

              (click)="savePermissionChanges()"

              [disabled]="isSavingPermission || !hasPermissionChanges()"

            >Save</button>

          </div>

        </div>

        <div class="card-body">

          <div class="permissions-grid">

            <div class="subadmin-list">

              <div

                class="subadmin-item"

                *ngFor="let admin of subAdmins"

                [class.selected]="selectedSubAdmin?.id === admin.id"

                (click)="selectSubAdmin(admin)"

              >

                <div class="subadmin-name">{{ admin.name }}</div>

                <div class="subadmin-email">{{ admin.email }}</div>

              </div>

              <div class="empty" *ngIf="!isLoadingSubAdmins && subAdmins.length === 0">Data coming soon</div>

            </div>

            <div class="subadmin-perms" *ngIf="selectedSubAdmin; else selectSubAdminTemplate">

              <div class="subadmin-perms-header">

                <div class="subadmin-perms-title">{{ selectedSubAdmin.name }}</div>

                <div class="subadmin-perms-subtitle">{{ selectedSubAdmin.email }}</div>

              </div>

              <div class="perm-list">

                <label class="perm-item" *ngFor="let perm of permissionKeys">

                  <input

                    type="checkbox"

                    [checked]="draftSubAdminPermissions.has(perm)"

                    [disabled]="isSavingPermission"

                    (change)="onPermissionDraftChange(perm, $event)"

                  />

                  <span>{{ formatPermissionLabel(perm) }}</span>

                </label>

              </div>

            </div>

            <ng-template #selectSubAdminTemplate>

              <div class="subadmin-perms empty">Select a sub admin to manage permissions</div>

            </ng-template>

          </div>

        </div>

      </div>

      

      <div class="stats-grid">

        <div class="stat-card">

          <div class="stat-icon blue">

            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">

              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>

            </svg>

          </div>

          <div class="stat-content">

            <h3>Total Users</h3>

            <p class="stat-number">{{ totalUsers }}</p>

            <span class="stat-change positive">+12.5%</span>

          </div>

        </div>



        <div class="stat-card">

          <div class="stat-icon green">

            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">

              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>

            </svg>

          </div>

          <div class="stat-content">

            <h3>Active Today</h3>

            <p class="stat-number">{{ activeUsers }}</p>

            <span class="stat-change positive">+8.2%</span>

          </div>

        </div>

      </div>



      <div class="content-card">

        <div class="card-header">

          <h3>User List</h3>

          <div class="header-actions">

            <input type="text" placeholder="Search users..." class="search-input" (input)="onSearch($event)">

            <button class="btn-primary">Add User</button>

          </div>

        </div>

        <div class="card-body">

          <div class="table-container">

            <table class="data-table">

              <thead>

                <tr>

                  <th>User</th>

                  <th>Email</th>

                  <th>Role</th>

                  <th>Status</th>

                  <th>Joined</th>

                  <th>Actions</th>

                </tr>

              </thead>

              <tbody>

                <tr *ngFor="let user of filteredUsers">

                  <td>

                    <div class="user-info">

                      <img [src]="getUserAvatar(user.name)" [alt]="user.name">

                      <span>{{ user.name }}</span>

                    </div>

                  </td>

                  <td>{{ user.email }}</td>

                  <td><span class="role-badge user">{{ user.role }}</span></td>

                  <td><span class="status-badge" [class.active]="user.is_active" [class.inactive]="!user.is_active">

                    {{ user.is_active ? 'Active' : 'Inactive' }}

                  </span></td>

                  <td>{{ formatDate(user.created_at) }}</td>

                  <td>

                    <button class="btn-icon" (click)="editUser(user)">✏️</button>

                    <button class="btn-icon" (click)="deleteUser(user)">🗑️</button>

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>



    <!-- Loading Template -->

    <ng-template #loadingTemplate>

      <div class="loading-container">

        <div class="loading-spinner"></div>

        <p>Loading users...</p>

      </div>

    </ng-template>

  `,

  styles: [`

    .page-container {

      display: flex;

      flex-direction: column;

      gap: 1.5rem;

    }



    .page-header h1 {

      margin: 0 0 0.5rem 0;

      font-size: 1.875rem;

      font-weight: 700;

      color: #1e293b;

    }



    .page-header p {

      margin: 0;

      color: #64748b;

      font-size: 1rem;

    }



    .loading-container {

      display: flex;

      flex-direction: column;

      align-items: center;

      justify-content: center;

      height: 400px;

      color: #64748b;

    }



    .loading-spinner {

      width: 40px;

      height: 40px;

      border: 4px solid #e2e8f0;

      border-top: 4px solid #667eea;

      border-radius: 50%;

      animation: spin 1s linear infinite;

      margin-bottom: 1rem;

    }



    @keyframes spin {

      0% { transform: rotate(0deg); }

      100% { transform: rotate(360deg); }

    }



    .stats-grid {

      display: grid;

      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

      gap: 1.5rem;

    }



    .stat-card {

      background: white;

      border-radius: 12px;

      padding: 1.5rem;

      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      border: 1px solid #e2e8f0;

      display: flex;

      align-items: center;

      gap: 1rem;

    }

  

    .stat-icon {

      width: 48px;

      height: 48px;

      border-radius: 12px;

      display: flex;

      align-items: center;

      justify-content: center;

      color: white;

    }



    .stat-icon.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }

    .stat-icon.green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }



    .stat-content h3 {

      margin: 0 0 0.5rem 0;

      font-size: 0.875rem;

      color: #64748b;

      font-weight: 500;

    }



    .stat-number {

      font-size: 1.5rem;

      font-weight: 700;

      color: #1e293b;

      margin: 0 0 0.25rem 0;

    }



    .stat-change {

      font-size: 0.75rem;

      font-weight: 600;

      color: #10b981;

    }



    .content-card {

      background: white;

      border-radius: 12px;

      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      border: 1px solid #e2e8f0;

      overflow: hidden;

    }



    .card-header {

      display: flex;

      justify-content: space-between;

      align-items: center;

      padding: 1.5rem;

      border-bottom: 1px solid #e2e8f0;

    }



    .card-header h3 {

      margin: 0;

      font-size: 1.125rem;

      font-weight: 600;

      color: #1e293b;

    }



    .header-actions {

      display: flex;

      gap: 1rem;

      align-items: center;

    }



    .search-input {

      padding: 0.5rem 1rem;

      border: 1px solid #e2e8f0;

      border-radius: 8px;

      font-size: 0.875rem;

      width: 250px;

    }



    .btn-primary {

      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

      color: white;

      border: none;

      padding: 0.625rem 1.25rem;

      border-radius: 8px;

      font-size: 0.875rem;

      font-weight: 500;

      cursor: pointer;

      transition: all 0.2s;

    }

    .btn-secondary {

      background: #f1f5f9;

      color: #0f172a;

      border: 1px solid #e2e8f0;

      padding: 0.625rem 1.25rem;

      border-radius: 8px;

      font-size: 0.875rem;

      font-weight: 500;

      cursor: pointer;

      transition: all 0.2s;

    }



    .btn-primary:hover {

      transform: translateY(-1px);

      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

    }

    .btn-secondary:hover {

      transform: translateY(-1px);

    }



    .card-body {

      padding: 1.5rem;

    }



    .table-container {

      overflow-x: auto;

    }



    .data-table {

      width: 100%;

      border-collapse: collapse;

    }



    .data-table th {

      text-align: left;

      padding: 0.75rem;

      background: #f8fafc;

      font-weight: 600;

      color: #374151;

      font-size: 0.875rem;

      border-bottom: 1px solid #e5e7eb;

    }



    .data-table td {

      padding: 0.75rem;

      border-bottom: 1px solid #f3f4f6;

      font-size: 0.875rem;

      color: #374151;

    }



    .data-table tr:hover {

      background: #f9fafb;

    }



    .user-info {

      display: flex;

      align-items: center;

      gap: 0.75rem;

    }



    .user-info img {

      width: 32px;

      height: 32px;

      border-radius: 50%;

    }



    .role-badge {

      padding: 0.25rem 0.75rem;

      border-radius: 999px;

      font-size: 0.75rem;

      font-weight: 500;

    }



    .role-badge.user {

      background: #dbeafe;

      color: #1e40af;

    }



    .status-badge {

      padding: 0.25rem 0.75rem;

      border-radius: 999px;

      font-size: 0.75rem;

      font-weight: 500;

    }



    .status-badge.active {

      background: #d1fae5;

      color: #065f46;

    }



    .status-badge.inactive {

      background: #fee2e2;

      color: #991b1b;

    }



    .btn-icon {

      background: none;

      border: none;

      cursor: pointer;

      padding: 0.25rem;

      margin-right: 0.5rem;

      border-radius: 4px;

      transition: background 0.2s;

    }



    .btn-icon:hover {

      background: #f3f4f6;

    }

    .meta {

      font-size: 0.875rem;

      color: #64748b;

      font-weight: 500;

    }

    .meta.error {

      color: #b91c1c;

    }

    .permissions-grid {

      display: grid;

      grid-template-columns: 320px 1fr;

      gap: 1.5rem;

    }

    .subadmin-list {

      border: 1px solid var(--border);

      border-radius: 10px;

      overflow: hidden;

      background: var(--surface);

      min-height: 180px;

    }

    .subadmin-item {

      padding: 0.85rem 1rem;

      border-bottom: 1px solid var(--border);

      cursor: pointer;

      transition: background 0.2s;

    }

    .subadmin-item:hover {

      background: var(--surface-2);

    }

    .subadmin-item.selected {

      background: rgba(102, 126, 234, 0.08);

      border-left: 3px solid #667eea;

    }

    .subadmin-name {

      font-weight: 700;

      color: var(--text);

      font-size: 0.95rem;

    }

    .subadmin-email {

      color: var(--muted);

      font-size: 0.8rem;

      margin-top: 0.15rem;

      overflow: hidden;

      text-overflow: ellipsis;

      white-space: nowrap;

    }

    .subadmin-perms {

      border: 1px solid var(--border);

      border-radius: 10px;

      padding: 1rem;

      background: var(--surface);

      min-height: 180px;

    }

    .subadmin-perms-header {

      padding-bottom: 0.75rem;

      border-bottom: 1px solid var(--border);

      margin-bottom: 0.75rem;

    }

    .subadmin-perms-title {

      font-weight: 800;

      color: var(--text);

      font-size: 1rem;

    }

    .subadmin-perms-subtitle {

      color: var(--muted);

      font-size: 0.85rem;

      margin-top: 0.25rem;

    }

    .perm-list {

      display: grid;

      grid-template-columns: 1fr 1fr;

      gap: 0.75rem;

    }

    .perm-item {

      display: flex;

      align-items: center;

      gap: 0.5rem;

      padding: 0.6rem 0.7rem;

      border: 1px solid var(--border);

      border-radius: 10px;

      color: var(--text);

      font-weight: 600;

      background: var(--surface-2);

    }

    .perm-item input {

      width: 16px;

      height: 16px;

    }

    @media (max-width: 1024px) {

      .permissions-grid {

        grid-template-columns: 1fr;

      }

      .perm-list {

        grid-template-columns: 1fr;

      }

    }

  `]

})

export class UsersPageComponent implements OnInit {

  users: User[] = [];

  filteredUsers: User[] = [];

  totalUsers = 0;

  activeUsers = 0;

  isLoading = true;

  isSuperAdmin = false;

  permissionKeys = ADMIN_PERMISSION_KEYS;

  subAdmins: AdminUserSummary[] = [];

  selectedSubAdmin: AdminUserSummary | null = null;

  selectedSubAdminPermissions = new Set<AdminPermission>();

  originalSubAdminPermissions = new Set<AdminPermission>();

  draftSubAdminPermissions = new Set<AdminPermission>();

  isLoadingSubAdmins = true;

  isSavingPermission = false;

  subAdminsError = '';



  constructor(
    private supabaseService: SupabaseService,
    private subAdminPermissionsService: SubAdminPermissionsService,
    private cdr: ChangeDetectorRef
  ) {}



  async ngOnInit() {

    this.isSuperAdmin = await this.subAdminPermissionsService.isSuperAdmin();

    await Promise.all([

      this.loadUsers(),

      this.loadSubAdmins()

    ]);

    this.cdr.detectChanges();

  }



  async loadSubAdmins() {

    try {

      this.isLoadingSubAdmins = true;

      this.subAdminsError = '';



      const admins = await this.subAdminPermissionsService.listAdminUsers();



      const superAdminIds = new Set<string>();

      const { data: superRows, error: superErr } = await this.supabaseService

        .getClient()

        .from('super_admins')

        .select('user_id');



      if (!superErr) {

        (superRows as SuperAdminRow[] | null | undefined)?.forEach((r) => {

          if (r?.user_id) superAdminIds.add(r.user_id);

        });

      }



      this.subAdmins = (admins || []).filter((a) => {

        const email = (a.email || '').toLowerCase();

        if (email === 'sarajamal02@gmail.com') return false;

        if (superAdminIds.has(a.id)) return false;

        return true;

      });



      if (!this.selectedSubAdmin && this.subAdmins.length > 0) {

        this.selectedSubAdmin = this.subAdmins[0];

        await this.loadPermissionsForSelectedSubAdmin();

      }



    } catch (e: any) {

      this.subAdminsError = e?.message || 'Failed to load sub admins';

    } finally {

      this.isLoadingSubAdmins = false;

      this.cdr.detectChanges();

    }

  }



  async selectSubAdmin(admin: AdminUserSummary) {

    if (this.selectedSubAdmin?.id === admin.id) return;

    this.selectedSubAdmin = admin;

    await this.loadPermissionsForSelectedSubAdmin();

  }



  private async loadPermissionsForSelectedSubAdmin(): Promise<void> {

    const id = this.selectedSubAdmin?.id;

    if (!id) {

      this.selectedSubAdminPermissions = new Set<AdminPermission>();

      this.originalSubAdminPermissions = new Set<AdminPermission>();

      this.draftSubAdminPermissions = new Set<AdminPermission>();

      return;

    }



    const perms = await this.subAdminPermissionsService.getPermissionsForAdmin(id);

    this.selectedSubAdminPermissions = perms;

    this.originalSubAdminPermissions = new Set<AdminPermission>(perms);

    this.draftSubAdminPermissions = new Set<AdminPermission>(perms);

  }



  onPermissionDraftChange(perm: AdminPermission, event: Event): void {

    const checked = (event.target as HTMLInputElement).checked;

    this.subAdminsError = '';

    if (checked) {

      this.draftSubAdminPermissions.add(perm);

      return;

    }

    this.draftSubAdminPermissions.delete(perm);

  }



  hasPermissionChanges(): boolean {

    if (!this.selectedSubAdmin) return false;

    if (this.draftSubAdminPermissions.size !== this.originalSubAdminPermissions.size) return true;

    for (const p of this.draftSubAdminPermissions) {

      if (!this.originalSubAdminPermissions.has(p)) return true;

    }

    return false;

  }



  cancelPermissionChanges(): void {

    this.subAdminsError = '';

    this.draftSubAdminPermissions = new Set<AdminPermission>(this.originalSubAdminPermissions);

  }



  async savePermissionChanges(): Promise<void> {

    const adminId = this.selectedSubAdmin?.id;

    if (!adminId) return;

    this.subAdminsError = '';

    this.isSavingPermission = true;

    try {

      const toGrant: AdminPermission[] = [];

      const toRevoke: AdminPermission[] = [];

      for (const p of this.draftSubAdminPermissions) {

        if (!this.originalSubAdminPermissions.has(p)) toGrant.push(p);

      }

      for (const p of this.originalSubAdminPermissions) {

        if (!this.draftSubAdminPermissions.has(p)) toRevoke.push(p);

      }

      for (const p of toGrant) {

        await this.subAdminPermissionsService.grantPermission(adminId, p);

      }

      for (const p of toRevoke) {

        await this.subAdminPermissionsService.revokePermission(adminId, p);

      }

      await this.loadPermissionsForSelectedSubAdmin();

    } catch (e: any) {

      this.subAdminsError = e?.message || 'Failed to save permissions';

      await this.loadPermissionsForSelectedSubAdmin();

    } finally {

      this.isSavingPermission = false;

    }

  }



  formatPermissionLabel(perm: AdminPermission): string {

    switch (perm) {

      case 'manage_products':

        return 'Manage Products';

      case 'manage_users':

        return 'Manage Users';

      case 'manage_sellers':

        return 'Manage Sellers';

      case 'manage_orders':

        return 'Manage Orders';

      case 'view_analytics':

        return 'View Analytics';

      case 'manage_settings':

        return 'Manage Settings';

      case 'manage_settings_general':

        return 'Manage Settings (General)';

      case 'manage_feature_flags':

        return 'Manage Feature Flags';

      case 'view_audit_log':

        return 'View Audit Log';

      default:

        return perm;

    }

  }



  async loadUsers() {

    try {

      this.isLoading = true;

      

      // Fetch users from database

      const { data, error } = await this.supabaseService.getClient()

        .from('profiles')

        .select('*')

        .eq('role', 'user')

        .order('created_at', { ascending: false });



      if (error) {

        console.error('Error fetching users:', error);

        return;

      }



      this.users = data as User[] || [];

      this.filteredUsers = [...this.users];

      this.totalUsers = this.users.length;

      

      // Calculate active users (simplified - users created in last 30 days)

      const thirtyDaysAgo = new Date();

      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      

      this.activeUsers = this.users.filter(user => 

        new Date(user.created_at) >= thirtyDaysAgo

      ).length;



    } catch (error) {

      console.error('Error loading users:', error);

    } finally {

      this.isLoading = false;

      this.cdr.detectChanges();

    }

  }



  onSearch(event: Event) {

    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();

    

    if (searchTerm === '') {

      this.filteredUsers = [...this.users];

    } else {

      this.filteredUsers = this.users.filter(user =>

        user.name.toLowerCase().includes(searchTerm) ||

        user.email.toLowerCase().includes(searchTerm) ||

        user.role.toLowerCase().includes(searchTerm)

      );

    }

  }



  getUserAvatar(name: string): string {

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff`;

  }



  formatDate(dateString: string): string {

    return new Date(dateString).toLocaleDateString();

  }



  editUser(user: User) {

    console.log('Edit user:', user);

    // TODO: Implement edit user functionality

  }



  async deleteUser(user: User) {

    if (confirm(`Are you sure you want to delete ${user.name}?`)) {

      try {

        const { error } = await this.supabaseService.getClient()

          .from('profiles')

          .delete()

          .eq('id', user.id);



        if (error) {

          console.error('Error deleting user:', error);

          alert('Error deleting user');

        } else {

          await this.loadUsers(); // Reload the list

        }

      } catch (error) {

        console.error('Error deleting user:', error);

        alert('Error deleting user');

      }

    }

  }

}

