import { Component, computed, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('smartDarna');
  isLoggedIn = signal(false);
  userName = signal('');
  userRole = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.updateAuthState();
  }

  private updateAuthState(): void {
    this.isLoggedIn.set(this.authService.isLoggedIn());
    const user = this.authService.getUser();
    if (user) {
      this.userName.set(user.name);
      this.userRole.set(user.role);
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.updateAuthState();
    this.router.navigate(['/login']);
  }
}
