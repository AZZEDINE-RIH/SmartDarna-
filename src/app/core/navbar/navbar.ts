import { Component, OnInit, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CartService } from '../../Pages/services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  cartCount = 0;
  isDarkMode = false;
  isLoggedIn = false;
  private authSubscription?: Subscription;

  ngOnInit() {
    this.cartService.getCartCount().subscribe(count => {
      this.cartCount = count;
    });

    if (isPlatformBrowser(this.platformId)) {
      this.isDarkMode = document.documentElement.classList.contains('dark');
    }

    this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.classList.toggle('dark', this.isDarkMode);
    }
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }
}
