import { Component, signal, OnInit, OnDestroy, ElementRef, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Navbar as DashboardNavbar } from './User/navbar/navbar';
import { Navbar as PublicNavbar } from './core/navbar/navbar';
import { Sidebar } from './User/sidebar/sidebar';
import { Footer } from './core/footer/footer';
import { AuthService } from './services/auth.service';
import { ThemeService } from './theme.service';
import { Subscription } from 'rxjs';
import { WhatsappButtonComponent } from './shared/whatsapp-button/whatsapp-button.component';
import { ScrollTopComponent } from './shared/scroll-top/scroll-top.component';
import { CursorFollowComponent } from './shared/cursor-follow/cursor-follow.component';
import { DarkCursorComponent } from './shared/dark-cursor/dark-cursor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    DashboardNavbar,
    PublicNavbar,
    Sidebar,
    Footer,
    WhatsappButtonComponent,
    ScrollTopComponent,
    CursorFollowComponent,
    DarkCursorComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoggedIn = signal(false);
  userName = signal('');
  userRole = signal('');
  isDarkMode = signal(false);
  isAuthRoute = signal(false);

  private themeSubscription?: Subscription;
  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router,
    private elementRef: ElementRef
  ) { }

  ngOnInit() {
    // Track current route to prevent dashboard flash on login
    this.routerSubscription = this.router.events.subscribe(event => {
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

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Small delay to ensure view is rendered
      setTimeout(() => this.initScrollReveal(), 100);
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollReveal();
    }
  }

  private initScrollReveal() {
    if (!isPlatformBrowser(this.platformId)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px'
    });

    const sections = this.elementRef.nativeElement.querySelectorAll('section, .section, .hero, .features-grid, .product-card');
    sections.forEach((section: any) => {
      section.classList.add('reveal');
      observer.observe(section);
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
