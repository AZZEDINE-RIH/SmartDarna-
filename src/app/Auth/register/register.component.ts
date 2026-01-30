import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, SignUpData } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  formData: SignUpData = {
    email: '',
    password: '',
    name: '',
    role: 'user'
  };
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Validate passwords match
    if (this.formData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.isLoading = false;
      return;
    }

    // Validate password strength
    if (this.formData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      this.isLoading = false;
      return;
    }

    try {
      console.log('Registering user with data:', {
        email: this.formData.email,
        name: this.formData.name,
        role: this.formData.role
      });
      
      await this.authService.signUp(this.formData);
      this.successMessage = 'Registration successful! Please check your email to verify your account.';
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } catch (error: any) {
      console.error('Registration error:', error);
      this.errorMessage = error.message || 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  get isFormValid(): boolean {
    return !!(
      this.formData.email &&
      this.formData.password &&
      this.confirmPassword &&
      this.formData.name &&
      this.formData.password === this.confirmPassword &&
      this.formData.password.length >= 6
    );
  }
}
