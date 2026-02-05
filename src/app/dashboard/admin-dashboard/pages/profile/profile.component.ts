import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../services/supabase.service';
import { Profile, ProfileService } from '../../../../services/profile.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-page">
      <div class="page-header">
        <div>
          <h1>My Profile</h1>
          <p class="subtitle">Your account information</p>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-state">Loading profile...</div>

      <div *ngIf="!isLoading" class="content">
        <div *ngIf="error" class="alert error">{{ error }}</div>

        <div *ngIf="profile" class="card">
          <div class="card-header">
            <div class="identity">
              <div class="avatar">
                <img
                  [src]="avatarUrl"
                  [alt]="profile.name"
                />
              </div>
              <div class="identity-text">
                <h3>{{ profile.name }}</h3>
                <p class="meta">{{ email || '-' }}</p>
              </div>
            </div>
          </div>

          <div class="grid">
            <div class="item">
              <div class="label">User ID</div>
              <div class="value mono">{{ profile.id }}</div>
            </div>

            <div class="item">
              <div class="label">Role</div>
              <div class="value">{{ profile.role }}</div>
            </div>

            <div class="item">
              <div class="label">Active</div>
              <div class="value">{{ profile.is_active ? 'Yes' : 'No' }}</div>
            </div>

            <div class="item">
              <div class="label">Created</div>
              <div class="value">{{ formatDate(profile.created_at) }}</div>
            </div>

            <div class="item" *ngIf="profile.phone">
              <div class="label">Phone</div>
              <div class="value">{{ profile.phone }}</div>
            </div>

            <div class="item" *ngIf="profile.address">
              <div class="label">Address</div>
              <div class="value">{{ profile.address }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
    }

    h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 900;
      color: var(--text);
    }

    .subtitle {
      margin: 0.35rem 0 0;
      color: var(--muted);
      font-weight: 700;
    }

    .loading-state {
      padding: 1rem;
      color: var(--muted);
      font-weight: 800;
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.2rem;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }

    .identity {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      min-width: 0;
    }

    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 18px;
      overflow: hidden;
      background: var(--surface-2);
      border: 1px solid var(--border);
      flex-shrink: 0;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .identity-text {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .identity-text h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 900;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .meta {
      margin: 0;
      color: var(--muted);
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.9rem;
    }

    .item {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 0.85rem;
    }

    .label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--muted);
      font-weight: 900;
      margin-bottom: 0.3rem;
    }

    .value {
      color: var(--text);
      font-weight: 800;
    }

    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.8rem;
      word-break: break-all;
    }

    .alert {
      padding: 0.85rem 1rem;
      border-radius: 12px;
      border: 1px solid var(--border);
      font-weight: 800;
    }

    .alert.error {
      color: var(--danger);
      border-color: rgba(239, 68, 68, 0.35);
      background: rgba(239, 68, 68, 0.08);
    }

    @media (max-width: 900px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfilePageComponent implements OnInit {
  isLoading = true;
  error: string | null = null;

  profile: Profile | null = null;
  email = '';
  avatarUrl = '';

  constructor(
    private supabaseService: SupabaseService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.waitForSession();

    const session = this.supabaseService.getCurrentSession();
    const userId = session?.user?.id;
    this.email = session?.user?.email || '';

    if (!userId) {
      this.error = 'Not authenticated.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.email || 'User')}&background=14b8a6&color=fff`;

    try {
      const { data, error } = await this.profileService.getProfile(userId);
      if (error) {
        throw error;
      }

      this.profile = data;
    } catch (e: any) {
      this.error = String(e?.message || 'Failed to load profile');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  formatDate(value: string): string {
    if (!value) return '';
    const d = new Date(value);
    return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  }

  private async waitForSession(maxWaitMs: number = 5000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const session = this.supabaseService.getCurrentSession();
      if (session?.user) return;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}
