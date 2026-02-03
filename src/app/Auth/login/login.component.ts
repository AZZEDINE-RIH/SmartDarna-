import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  focusedField: 'email' | 'password' | null = null;
  pupilX = 0;
  pupilY = 0;
  coverEyes = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  async onSubmit(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Basic validation
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      this.isLoading = false;
      return;
    }

    console.log('Attempting login with email:', this.email);

    try {
      await this.authService.signIn(this.email, this.password);
      // Navigation is handled by auth state change in AuthService
    } catch (error: any) {
      console.error('Login error:', error);

      this.ngZone.run(() => {
        // More specific error messages
        if (error.message?.includes('Invalid login credentials')) {
          this.errorMessage = 'Invalid email or password. Please check your credentials or register first.';
        } else if (error.message?.includes('Email not confirmed')) {
          this.errorMessage = 'Please confirm your email address before logging in.';
        } else {
          this.errorMessage = error.message || 'Login failed. Please try again.';
        }
      });
    } finally {
      this.ngZone.run(() => {
        this.isLoading = false;
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  onFieldFocus(field: 'email' | 'password'): void {
    this.focusedField = field;
    this.coverEyes = field === 'password';
  }

  onFieldBlur(field: 'email' | 'password'): void {
    if (this.focusedField === field) {
      this.focusedField = null;
    }
    this.coverEyes = false;
    this.pupilX = 0;
    this.pupilY = 0;
  }

  onEmailInput(value: string): void {
    if (this.focusedField !== 'email') return;
    // Simple "follow" effect based on text length (no DOM measurements required)
    const len = (value || '').length;
    const x = Math.max(-10, Math.min(10, (len - 8) * 1.35));
    this.pupilX = x;
    this.pupilY = -3;
  }

  onPasswordInput(value: string): void {
    if (this.focusedField !== 'password') return;
    // Subtle movement even while covering eyes
    const len = (value || '').length;
    const x = Math.max(-6, Math.min(6, (len - 6) * 1));
    this.pupilX = x;
    this.pupilY = 0;
  }

  async signInWithGithub(): Promise<void> {
    try {
      await this.authService.signInWithGithub();
    } catch (error: any) {
      this.errorMessage = error.message || 'GitHub sign in failed.';
    }
  }
}
