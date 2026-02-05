import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <div>
          <h1>Account Settings</h1>
          <p class="subtitle">Update your email and password</p>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-state">Loading settings...</div>

      <div *ngIf="!isLoading" class="content">
        <div class="card">
          <div class="card-header">
            <h3>Email</h3>
            <div class="card-actions">
              <button class="btn primary" type="button" (click)="updateEmail()" [disabled]="isSavingEmail">
                {{ isSavingEmail ? 'Saving...' : 'Update email' }}
              </button>
            </div>
          </div>

          <div *ngIf="emailError" class="alert error">{{ emailError }}</div>
          <div *ngIf="emailSuccess" class="alert success">{{ emailSuccess }}</div>

          <div class="form">
            <div class="field">
              <label>Current email</label>
              <input class="input" type="text" [value]="currentEmail" disabled />
            </div>

            <div class="field">
              <label>New email</label>
              <input class="input" type="email" [(ngModel)]="newEmail" placeholder="name@example.com" />
              <p class="help">If email confirmation is enabled, you may need to confirm the change from your inbox.</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Password</h3>
            <div class="card-actions">
              <button class="btn primary" type="button" (click)="updatePassword()" [disabled]="isSavingPassword">
                {{ isSavingPassword ? 'Saving...' : 'Update password' }}
              </button>
            </div>
          </div>

          <div *ngIf="passwordError" class="alert error">{{ passwordError }}</div>
          <div *ngIf="passwordSuccess" class="alert success">{{ passwordSuccess }}</div>

          <div class="form">
            <div class="field">
              <label>New password</label>
              <input class="input" type="password" [(ngModel)]="newPassword" placeholder="New password" />
            </div>
            <div class="field">
              <label>Confirm new password</label>
              <input class="input" type="password" [(ngModel)]="confirmPassword" placeholder="Confirm new password" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text);
    }

    .subtitle {
      margin: 0.25rem 0 0 0;
      color: var(--muted);
      font-size: 0.9rem;
      font-weight: 500;
    }

    .loading-state {
      padding: 1.25rem;
      border: 1px dashed var(--border);
      border-radius: 12px;
      background: var(--surface);
      color: var(--muted);
      font-weight: 700;
    }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.1rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.85rem;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 900;
      color: var(--text);
    }

    .card-actions {
      display: flex;
      gap: 0.6rem;
      align-items: center;
    }

    .tabs {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .tab {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.55rem 0.85rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 900;
      font-size: 0.85rem;
      transition: all 0.2s ease;
    }

    .tab:hover {
      background: var(--surface-2);
      border-color: var(--border-2);
      transform: translateY(-1px);
    }

    .tab.active {
      background: rgba(20, 184, 166, 0.12);
      border-color: rgba(20, 184, 166, 0.45);
      color: var(--text);
    }

    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .btn {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.6rem 0.9rem;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 800;
      font-size: 0.85rem;
      transition: all 0.2s ease;
    }

    .btn:hover:enabled {
      background: var(--surface-2);
      border-color: var(--border-2);
      transform: translateY(-1px);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn.primary {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
    }

    .btn.primary:hover:enabled {
      filter: brightness(0.98);
    }

    .alert {
      padding: 0.75rem 0.9rem;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--surface-2);
      font-weight: 800;
      margin-bottom: 0.75rem;
    }

    .alert.error {
      color: var(--danger);
      border-color: rgba(239, 68, 68, 0.35);
      background: rgba(239, 68, 68, 0.08);
    }

    .alert.success {
      color: var(--accent);
      border-color: rgba(20, 184, 166, 0.35);
      background: rgba(20, 184, 166, 0.08);
    }

    .empty {
      padding: 1rem;
      color: var(--muted);
      font-weight: 800;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .field.row {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    label {
      font-weight: 900;
      color: var(--text);
      font-size: 0.9rem;
    }

    .input {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.75rem 0.9rem;
      background: var(--surface);
      color: var(--text);
      outline: none;
      font-weight: 700;
    }

    .input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.12);
    }

    .help {
      margin: 0;
      color: var(--muted);
      font-size: 0.85rem;
      font-weight: 600;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 54px;
      height: 30px;
      flex-shrink: 0;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--surface-2);
      border: 1px solid var(--border);
      transition: 0.2s;
      border-radius: 999px;
    }

    .slider:before {
      position: absolute;
      content: '';
      height: 24px;
      width: 24px;
      left: 3px;
      bottom: 2px;
      background: white;
      transition: 0.2s;
      border-radius: 999px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    input:checked + .slider {
      background: rgba(20, 184, 166, 0.2);
      border-color: rgba(20, 184, 166, 0.55);
    }

    input:checked + .slider:before {
      transform: translateX(24px);
    }

    .btn.danger {
      border-color: rgba(239, 68, 68, 0.55);
      background: rgba(239, 68, 68, 0.08);
      color: var(--danger);
    }

    .flags {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .flag-row {
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 0.9rem;
      background: var(--surface-2);
      display: flex;
      gap: 0.9rem;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .flag-main {
      display: grid;
      grid-template-columns: 1fr 2fr 160px;
      gap: 0.8rem;
      flex: 1;
      min-width: 320px;
    }

    .flag-actions {
      display: flex;
      gap: 0.6rem;
      align-items: center;
    }

    .flag-key,
    .flag-desc,
    .flag-audience {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .audit-table {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: 14px;
      background: var(--surface);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }

    thead {
      background: var(--surface-2);
      border-bottom: 1px solid var(--border);
    }

    th, td {
      text-align: left;
      padding: 0.8rem 0.9rem;
      border-bottom: 1px solid var(--border);
      color: var(--text);
      white-space: nowrap;
    }

    th {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--muted);
      font-weight: 900;
    }

    @media (max-width: 1024px) {
      .flag-main {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SettingsPageComponent implements OnInit {
  isLoading = true;

  currentEmail = '';
  newEmail = '';

  newPassword = '';
  confirmPassword = '';

  isSavingEmail = false;
  isSavingPassword = false;

  emailError: string | null = null;
  emailSuccess: string | null = null;
  passwordError: string | null = null;
  passwordSuccess: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.waitForSession();

    this.loadAccountFromSession();
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  async updateEmail(): Promise<void> {
    this.emailError = null;
    this.emailSuccess = null;

    const email = String(this.newEmail || '').trim();
    if (!email) {
      this.emailError = 'Please enter a valid email.';
      this.cdr.detectChanges();
      return;
    }

    if (email.toLowerCase() === (this.currentEmail || '').toLowerCase()) {
      this.emailError = 'New email is the same as the current email.';
      this.cdr.detectChanges();
      return;
    }

    try {
      this.isSavingEmail = true;
      this.cdr.detectChanges();

      const { error } = await this.supabaseService.getClient().auth.updateUser({ email });
      if (error) throw error;

      this.emailSuccess = 'Email update requested. Please check your inbox to confirm.';
      this.cdr.detectChanges();
    } catch (err: any) {
      this.emailError = String(err?.message || 'Failed to update email');
      this.cdr.detectChanges();
    } finally {
      this.isSavingEmail = false;
      this.cdr.detectChanges();
    }
  }

  async updatePassword(): Promise<void> {
    this.passwordError = null;
    this.passwordSuccess = null;

    const pass = String(this.newPassword || '');
    const confirm = String(this.confirmPassword || '');

    if (!pass || pass.length < 6) {
      this.passwordError = 'Password must be at least 6 characters.';
      this.cdr.detectChanges();
      return;
    }

    if (pass !== confirm) {
      this.passwordError = 'Passwords do not match.';
      this.cdr.detectChanges();
      return;
    }

    try {
      this.isSavingPassword = true;
      this.cdr.detectChanges();

      const { error } = await this.supabaseService.getClient().auth.updateUser({ password: pass });
      if (error) throw error;

      this.passwordSuccess = 'Password updated successfully.';
      this.newPassword = '';
      this.confirmPassword = '';
      this.cdr.detectChanges();
    } catch (err: any) {
      this.passwordError = String(err?.message || 'Failed to update password');
      this.cdr.detectChanges();
    } finally {
      this.isSavingPassword = false;
      this.cdr.detectChanges();
    }
  }

  private loadAccountFromSession(): void {
    const session = this.supabaseService.getCurrentSession();
    const email = session?.user?.email || '';
    this.currentEmail = email;
    this.newEmail = email;
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
