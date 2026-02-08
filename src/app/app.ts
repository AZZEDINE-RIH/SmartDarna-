import { Component, computed, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

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
  isDarkMode = signal(false);
  currentUrl = signal('');

  private readonly themeStorageKey = 'smartdarna_theme';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.initTheme();
    this.updateAuthState();

    if (typeof window !== 'undefined') {
      this.currentUrl.set(this.router.url || '');
      this.router.events
        .pipe(filter((e: any) => e instanceof NavigationEnd))
        .subscribe(() => {
          this.currentUrl.set(this.router.url || '');
          this.syncThemeFromStorage();
          this.updateAuthState();
        });
    }
  }

  toggleTheme(): void {
    this.applyTheme(!this.isDarkMode(), true);
  }

  showNavbar(): boolean {
    return false;
  }

  showFloatingThemeToggle(): boolean {
    return !this.isLoggedIn();
  }

  private initTheme(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const saved = window.localStorage.getItem(this.themeStorageKey);
    if (saved === 'dark') {
      this.applyTheme(true, false);
      return;
    }
    if (saved === 'light') {
      this.applyTheme(false, false);
      return;
    }

    this.applyTheme(false, false);
  }

  private syncThemeFromStorage(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const saved = window.localStorage.getItem(this.themeStorageKey);
    if (saved === 'dark') {
      this.applyTheme(true, false);
      return;
    }
    if (saved === 'light') {
      this.applyTheme(false, false);
    }
  }

  private applyTheme(isDark: boolean, persist: boolean): void {
    this.isDarkMode.set(isDark);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
    }
    if (persist && typeof window !== 'undefined') {
      window.localStorage.setItem(this.themeStorageKey, isDark ? 'dark' : 'light');
    }
  }

  private updateAuthState(): void {
    this.isLoggedIn.set(this.authService.isLoggedIn());
    const user = this.authService.getUserSync();
    if (user) {
      this.userName.set(user.name || '');
      this.userRole.set(user.role || '');
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.updateAuthState();
    this.router.navigate(['/login']);
  }
}
