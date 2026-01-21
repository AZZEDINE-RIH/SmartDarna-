import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  name = signal('');
  email = signal('');
  password = signal('');
  passwordConfirm = signal('');
  errorMessage = signal('');
  isLoading = signal(false);
  isFlipped = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleFlip(): void {
    this.isFlipped.set(!this.isFlipped());
    this.router.navigate(['/login']);
  }

  onRegister(): void {
    const name = this.name().trim();
    const email = this.email().trim();
    const password = this.password();
    const passwordConfirm = this.passwordConfirm();

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
      this.errorMessage.set('All fields are required');
      return;
    }

    if (password !== passwordConfirm) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.errorMessage.set('Please enter a valid email address');
      return;
    }

    // Clear error message and set loading
    this.errorMessage.set('');
    this.isLoading.set(true);

    // Simulate API call delay
    setTimeout(() => {
      try {
        this.authService.register(name, email, password);
        this.isLoading.set(false);
        // Redirect to login after successful registration
        this.router.navigate(['/login']);
      } catch (error: any) {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Registration failed. Please try again.');
      }
    }, 500);
  }
}