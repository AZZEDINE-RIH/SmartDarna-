import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseAuthService } from '../../app/services/supabase-auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  name = signal('');
  email = signal('');
  password = signal('');
  passwordConfirm = signal('');
  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(false);

  private supabaseAuthService = inject(SupabaseAuthService);
  private router = inject(Router);

  async onRegister(): Promise<void> {
    const name = this.name().trim();
    const email = this.email().trim();
    const password = this.password();
    const passwordConfirm = this.passwordConfirm();

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
      this.errorMessage.set('All fields are required');
      this.successMessage.set('');
      return;
    }

    if (password !== passwordConfirm) {
      this.errorMessage.set('Passwords do not match');
      this.successMessage.set('');
      return;
    }

    if (password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long');
      this.successMessage.set('');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.errorMessage.set('Please enter a valid email address');
      this.successMessage.set('');
      return;
    }

    // Clear messages and set loading
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);

    try {
      // Register with Supabase
      const result = await this.supabaseAuthService.signUp(email, password, name, 'user');

      if (result.success) {
        this.successMessage.set('Registration successful! Redirecting to login...');
        console.log('✅ User registered successfully:', result.data);
        
        // Redirect to login after successful registration
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      } else {
        // Handle error message from different error types
        let errorMsg = 'Registration failed. Please try again.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMsg = result.error;
          } else if (typeof result.error === 'object' && result.error !== null && 'message' in result.error) {
            errorMsg = (result.error as any).message;
          }
        }
        this.errorMessage.set(errorMsg);
        console.error('❌ Registration error:', result.error);
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Registration failed. Please try again.';
      this.errorMessage.set(errorMsg);
      console.error('❌ Unexpected error during registration:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}