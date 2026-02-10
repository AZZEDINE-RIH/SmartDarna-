import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from './User/navbar/navbar';
import { Sidebar } from './User/sidebar/sidebar';
import { AuthService } from './services/auth.service';
import { ThemeService } from './theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Navbar, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  isLoggedIn = signal(false);
  userName = signal('');
  userRole = signal('');
  isDarkMode = signal(false);
  isAuthRoute = signal(false);

  private themeSubscription?: Subscription;
  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) { }

  ngOnInit() {
    // Track current route to prevent dashboard flash on login
    // We check if url contains '/auth'
    this.routerSubscription = this.router.events.subscribe(event => {
      // Use direct router.url check which is reliable
      this.isAuthRoute.set(this.router.url.includes('/auth'));
    });

    // Initial check
    this.isAuthRoute.set(this.router.url.includes('/auth'));

    // Theme subscription
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(
      (mode) => this.isDarkMode.set(mode)
    );

    // Auth subscription to update UI state
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.isLoggedIn.set(!!user);
      if (user) {
        const profile = this.authService.getUserSync();
        if (profile) {
          this.userName.set(profile.name || '');
          this.userRole.set(profile.role || '');
        }
      } else {
        this.userName.set('');
        this.userRole.set('');
      }
    });
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  async onLogout() {
    await this.authService.signOut();
    this.router.navigate(['/auth/login']);
  }
}
