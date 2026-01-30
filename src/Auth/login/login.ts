import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseAuthService } from '../../app/services/supabase-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = signal('');
  isLoading = signal(false);
  isFlipped = signal(false);

  private supabaseAuthService = inject(SupabaseAuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Auto-redirect if already logged in
    if (this.supabaseAuthService.isLoggedIn()) {
      this.redirectToDashboard();
    }
  }

  toggleFlip(): void {
    this.isFlipped.set(!this.isFlipped());
    this.router.navigate(['/register']);
  }

  async onLogin(): Promise<void> {
    console.log('🔍 Login button clicked');
    
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      this.errorMessage.set('Please fill in all required fields correctly');
      return;
    }

    const { email, password } = this.loginForm.value;
    console.log('🔍 Attempting login with email:', email);
    
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      console.log('🔍 Calling signIn...');
      const result = await this.supabaseAuthService.signIn(email, password);
      console.log('🔍 SignIn result:', result);

      if (result.success) {
        console.log('🔍 Login successful, redirecting...');
        this.errorMessage.set('');
        
        // Profile should already be loaded (or fallback user created), redirect immediately
        this.redirectToDashboard();
        // Keep loading state true during navigation
      } else {
        console.log('🔍 Login failed:', result);
        this.isLoading.set(false);
        let errorMsg = 'Invalid email or password';
        if (result.error) {
           if (typeof result.error === 'string') errorMsg = result.error;
           else if ((result.error as any).message) errorMsg = (result.error as any).message;
        }
        this.errorMessage.set(errorMsg);
        this.loginForm.patchValue({ password: '' });
      }
    } catch (error) {
      console.log('🔍 Login exception:', error);
      this.isLoading.set(false);
      this.errorMessage.set('An unexpected error occurred');
      console.error('Login error:', error);
    }
  }

  private redirectToDashboard(): void {
    const role = this.supabaseAuthService.getUserRole();
    console.log('🔍 Redirecting to dashboard. Role:', role);
    
    // Role must be set - if null, something went wrong with profile loading
    if (!role) {
      console.error('🔍 Cannot redirect - no role found. User profile not loaded.');
      this.errorMessage.set('Failed to load user profile. Please try again.');
      this.isLoading.set(false);
      return;
    }
    
    switch (role) {
      case 'admin':
        console.log('🔍 Navigating to admin dashboard');
        this.router.navigate(['/dashboard/overview']);
        break;
      case 'seller':
        console.log('🔍 Navigating to seller dashboard');
        this.router.navigate(['/vendeur-dashboard']);
        break;
      case 'user':
      default:
        console.log('🔍 Navigating to user home');
        this.router.navigate(['/home']);
        break;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  // Test credentials helper (optional - remove in production)
  get demoCredentials() {
    return [
      { email: 'user@smartdarna.com', role: 'User' },
      { email: 'seller@smartdarna.com', role: 'Seller' },
      { email: 'admin@smartdarna.com', role: 'Admin' }
    ];
  }
}