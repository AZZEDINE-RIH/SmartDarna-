import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

interface SidebarChild {
  id: string;
  label: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  type: 'page' | 'submenu';
  children?: SidebarChild[];
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  logoSrc: string = '/assets/images/logo light without bg.png';

  sidebarItems: SidebarItem[] = 
  [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'stats-chart-outline',
      type: 'page'
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
      type: 'page'
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
    if (item.type === 'page') {
      this.handlePageClick(item.id);
    } else {
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
