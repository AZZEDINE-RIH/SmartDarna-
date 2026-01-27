import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../theme.service';
import { Subscription } from 'rxjs';

interface SidebarChild {
  id: string;
  label: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  type: 'page' | 'submenu' | 'link';
  route?: string;
  children?: SidebarChild[];
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
      id: 'analytics',
      label: 'Analytics',
      icon: 'analytics-outline',
      type: 'submenu',
      children: [
        { id: 'overview', label: 'Overview' },
        { id: 'reports', label: 'Reports' },
        { id: 'insights', label: 'Insights' }
      ]
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: 'mail-outline',
      type: 'page'
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
    type: 'submenu',
    children: [
      { id: 'preferences', label: 'Preferences' },
      { id: 'security', label: 'Security' }
    ]
  };

  profileItem: SidebarItem = {
    id: 'profile',
    label: 'Profile',
    icon: 'person-outline',
    type: 'page'
  };

  activeItem: string = 'dashboard';
  openSubmenu: string | null = null;

  getButtonClass(itemId: string): string {
    return this.activeItem === itemId ? 'active' : '';
  }

  getChevronClass(itemId: string): string {
    return `ml-auto transition-transform duration-300 ${
      this.activeItem === itemId ? 'rotate-180' : ''
    }`;
  }
  
  getSubmenuButtonClass(childId: string): string {
    return this.activeItem === childId ? 'active' : '';
  }

  handleItemClick(item: SidebarItem): void {
    // If it's a link => navigate
    if (item.type === 'link' && item.route) {
      this.activeItem = item.id;
      this.openSubmenu = null;
      this.router.navigate([item.route]);
      return;
    }

    // If it's a page => keep your logic
    if (item.type === 'page') {
      this.handlePageClick(item.id);
      return;
    }

    // If it's submenu => toggle submenu
    if (item.type === 'submenu') {
      this.handleSubmenuToggle(item.id);
    }
  }

  handlePageClick(id: string): void {
    this.activeItem = id;
    this.openSubmenu = null;
  }

  handleSubmenuToggle(id: string): void {
    this.activeItem = this.activeItem === id ? '' : id;
    this.openSubmenu = this.openSubmenu === id ? null : id;
  }
}
