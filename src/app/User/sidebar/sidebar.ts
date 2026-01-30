import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../theme.service';
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

  constructor(private router: Router, private themeService: ThemeService) {}

  ngOnInit() {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });
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
}