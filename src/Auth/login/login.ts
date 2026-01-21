import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);
  isFlipped = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Auto-redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectToDashboard();
    }
  }

  toggleFlip(): void {
    this.isFlipped.set(!this.isFlipped());
    this.router.navigate(['/register']);
  }

  onLogin(): void {
    const email = this.email().trim();
    const password = this.password().trim();

    // Validation
    if (!email || !password) {
      this.errorMessage.set('Please enter email and password');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // Simulate a small delay for better UX
    setTimeout(() => {
      const user = this.authService.login(email, password);

      if (user) {
        this.errorMessage.set('');
        this.redirectToDashboard();
      } else {
        this.isLoading.set(false);
        this.errorMessage.set('Invalid email or password');
        this.password.set('');
      }
    }, 500);
  }

  private redirectToDashboard(): void {
    const user = this.authService.getUser();
    if (user) {
      switch (user.role) {
        case 'admin':
          this.router.navigate(['/admin-dashboard']);
          break;
        case 'vendeur':
          this.router.navigate(['/vendeur-dashboard']);
          break;
        case 'user':
        default:
          this.router.navigate(['/home']);
          break;
      }
    }
  }

  // Test credentials helper (optional - remove in production)
  get demoCredentials() {
    return [
      { email: 'user@example.com', role: 'User' },
      { email: 'vendeur@example.com', role: 'Seller' },
      { email: 'admin@example.com', role: 'Admin' }
    ];
  }
}