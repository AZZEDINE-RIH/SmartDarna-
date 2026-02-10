import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ThemeService } from '../../theme.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  isDarkMode: boolean = false;
  private themeSubscription?: Subscription;

  constructor(private themeService: ThemeService, private router: Router) {}

  ngOnInit() {
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  goToUnreadMessages(): void {
    this.router.navigate(['/user/messages'], { queryParams: { tab: 'unread' } });
  }

  goToSettings(): void {
    this.router.navigate(['/user/settings']);
  }
}
