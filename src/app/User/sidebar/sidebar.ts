import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../theme.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  type: 'page' | 'link';
  route?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit, OnDestroy {
  logoSrc: string = '/assets/images/logo light without bg.png';
  isDarkMode: boolean = false;
  private themeSubscription?: Subscription;

  // User profile data
  userName: string = 'Loading...';
  userEmail: string = '';
  userInitials: string = 'U';

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });

    // Load authenticated user profile
    this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      const user = await this.authService.getUser();
      if (user) {
        this.userName = user.name || 'User';
        this.userEmail = user.email || '';

        // Generate initials from name
        const nameParts = this.userName.split(' ');
        if (nameParts.length >= 2) {
          this.userInitials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
        } else {
          this.userInitials = this.userName.substring(0, 2).toUpperCase();
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
  }

  sidebarItems: SidebarItem[] =
    [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'stats-chart-outline',
        type: 'link',
        route: '/user/dashboard'

      },
      {
        id: 'orders',
        label: 'Orders',
        icon: 'analytics-outline',
        type: 'link',
        route: '/user/orders'
      },
      {
        id: 'messages',
        label: 'Messages',
        icon: 'mail-outline',
        type: 'link',
        route: '/user/messages'
      },
      {
        id: 'declarations',
        label: 'Declarations',
        icon: 'trash-bin-outline',
        type: 'link',
        route: '/user/declarations'
      },

    ];

  settingsItem: SidebarItem = {
    id: 'settings',
    label: 'Settings',
    icon: 'settings-outline',
    type: 'link',
    route: '/user/settings'
  };


  activeItem: string = 'dashboard';
  handleItemClick(item: SidebarItem): void {
    // If it's a link => navigate
    if (item.type === 'link' && item.route) {
      this.activeItem = item.id;
      this.router.navigate([item.route]);
      return;
    }
  }

  navigateToProfile(): void {
    this.router.navigate(['/user/profile']);
  }
}