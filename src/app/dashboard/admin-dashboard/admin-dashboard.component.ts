import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#logo-gradient)"/>
                <path d="M16 8L20 12L16 16L12 12L16 8Z" fill="white"/>
                <path d="M8 16L12 20L8 24L4 20L8 16Z" fill="white" opacity="0.8"/>
                <path d="M24 16L28 20L24 24L20 20L24 16Z" fill="white" opacity="0.8"/>
                <defs>
                  <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stop-color="#667eea"/>
                    <stop offset="100%" stop-color="#764ba2"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="logo-text" [class.hidden]="sidebarCollapsed">
              <h2>SmartDarna</h2>
              <span>Admin Panel</span>
            </div>
          </div>
          <button class="toggle-btn" (click)="toggleSidebar()">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <nav class="sidebar-nav">
          <ul>
            <li *ngFor="let item of menuItems">
              <a 
                [routerLink]="item.route" 
                routerLinkActive="active" 
                [routerLinkActiveOptions]="{exact: item.exact}"
                class="nav-item"
                [title]="sidebarCollapsed ? item.label : ''">
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-text" [class.hidden]="sidebarCollapsed">{{ item.label }}</span>
                <span *ngIf="item.badge" class="nav-badge">{{ item.badge }}</span>
              </a>
            </li>
          </ul>
        </nav>

        <div class="sidebar-footer">
          <div class="user-profile" [class.hidden]="sidebarCollapsed">
            <div class="user-avatar">
              <img [src]="user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.name || 'Admin') + '&background=667eea&color=fff'" [alt]="user?.name">
            </div>
            <div class="user-info">
              <p class="user-name">{{ user?.name || 'Admin User' }}</p>
              <p class="user-role">{{ user?.role || 'Administrator' }}</p>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()" [title]="sidebarCollapsed ? 'Logout' : ''">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 3h10a2 2 0 012 2v4h-2V5H3v10h8v2H3a2 2 0 01-2-2V5a2 2 0 012-2z"/>
              <path d="M15 7l5 5-5 5M7 12h13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span [class.hidden]="sidebarCollapsed">Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Top Bar -->
        <header class="topbar">
          <div class="topbar-left">
            <h1 class="page-title">{{ getCurrentPageTitle() }}</h1>
            <nav class="breadcrumb">
              <a href="#" class="breadcrumb-item">Dashboard</a>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item current">{{ getCurrentPageTitle() }}</span>
            </nav>
          </div>
          
          <div class="topbar-right">
            <button class="notification-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                <path d="M10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
              </svg>
              <span class="notification-badge">3</span>
            </button>
            
            <div class="search-box">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"/>
              </svg>
              <input type="text" placeholder="Search...">
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      display: flex;
      height: 100vh;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      border-right: 1px solid #334155;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      position: relative;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid #334155;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      flex-shrink: 0;
    }

    .logo-text h2 {
      color: white;
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
    }

    .logo-text span {
      color: #94a3b8;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .toggle-btn {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
    }

    .sidebar-nav ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.875rem 1.5rem;
      color: #cbd5e1;
      text-decoration: none;
      transition: all 0.2s;
      position: relative;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: white;
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.05) 100%);
      color: #667eea;
      border-left: 3px solid #667eea;
    }

    .nav-icon {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
    }

    .nav-text {
      font-weight: 500;
      white-space: nowrap;
      opacity: 1;
      transition: opacity 0.3s;
    }

    .nav-text.hidden {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    .nav-badge {
      background: #ef4444;
      color: white;
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      margin-left: auto;
    }

    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid #334155;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 1rem;
      opacity: 1;
      transition: opacity 0.3s;
    }

    .user-profile.hidden {
      opacity: 0;
      height: 0;
      overflow: hidden;
      margin: 0;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      overflow: hidden;
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-info p {
      margin: 0;
      line-height: 1.3;
    }

    .user-name {
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-role {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 0.75rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.3);
    }

    /* Main Content */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .topbar {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 73px;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .breadcrumb-item {
      color: #64748b;
      text-decoration: none;
      font-size: 0.875rem;
    }

    .breadcrumb-item.current {
      color: #1e293b;
      font-weight: 500;
    }

    .breadcrumb-separator {
      color: #cbd5e1;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .notification-btn {
      position: relative;
      background: none;
      border: 1px solid #e2e8f0;
      color: #64748b;
      padding: 0.625rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .notification-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #1e293b;
    }

    .notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: white;
      font-size: 0.625rem;
      padding: 0.125rem 0.375rem;
      border-radius: 999px;
      font-weight: 600;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.625rem 1rem;
      min-width: 300px;
    }

    .search-box svg {
      color: #94a3b8;
    }

    .search-box input {
      border: none;
      background: none;
      outline: none;
      flex: 1;
      font-size: 0.875rem;
      color: #1e293b;
    }

    .search-box input::placeholder {
      color: #94a3b8;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: -280px;
        z-index: 1000;
        height: 100vh;
      }

      .sidebar.open {
        left: 0;
      }

      .main-content {
        margin-left: 0;
      }

      .search-box {
        min-width: 200px;
      }
    }
  `]
})
export class AdminDashboardComponent {
  sidebarCollapsed = false;
  user: any | null = null;

  menuItems = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard/overview', exact: true },
    { label: 'Products', icon: '📦', route: '/dashboard/products', exact: true },
    { label: 'Users', icon: '👥', route: '/dashboard/users', exact: true },
    { label: 'Sellers', icon: '🏪', route: '/dashboard/sellers', exact: true, badge: '12' },
    { label: 'Orders', icon: '🛒', route: '/dashboard/orders', exact: true, badge: '5' },
    { label: 'Analytics', icon: '📈', route: '/dashboard/analytics', exact: true },
    { label: 'Settings', icon: '⚙️', route: '/dashboard/settings', exact: true }
  ];

  constructor(private authService: AuthService) {
    this.authService.currentUser.subscribe(user => {
      if (!user) {
        this.user = null;
        return;
      }

      void this.authService.getUser().then(profile => {
        this.user = profile;
      });
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  getCurrentPageTitle(): string {
    // Check if running in browser environment
    if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
      const currentRoute = window.location.pathname;
      const menuItem = this.menuItems.find(item => 
        currentRoute.includes(item.route) || 
        (item.route === '/dashboard/overview' && currentRoute === '/dashboard')
      );
      return menuItem ? menuItem.label : 'Dashboard';
    }
    return 'Dashboard';
  }

  async logout() {
    await this.authService.signOut();
    // Check if running in browser environment
    if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
      window.location.href = '/login';
    }
  }
}
