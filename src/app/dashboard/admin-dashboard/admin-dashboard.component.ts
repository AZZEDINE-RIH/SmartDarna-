import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminPermission, SubAdminPermissionsService } from '../../services/sub-admin-permissions.service';

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
            <li *ngFor="let item of visibleMenuItems">
              <a 
                [routerLink]="item.route" 
                routerLinkActive="active" 
                [routerLinkActiveOptions]="{exact: item.exact}"
                class="nav-item"
                [title]="sidebarCollapsed ? item.label : ''">
                <span class="nav-icon" [ngSwitch]="item.key">
                  <svg *ngSwitchCase="'dashboard'" viewBox="0 0 24 24" fill="none">
                    <path d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8V15H3v6Zm10-10h8V3h-8v8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  </svg>
                  <svg *ngSwitchCase="'products'" viewBox="0 0 24 24" fill="none">
                    <path d="M21 8l-9-5-9 5 9 5 9-5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                    <path d="M3 8v8l9 5 9-5V8" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                    <path d="M12 13v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                  <svg *ngSwitchCase="'users'" viewBox="0 0 24 24" fill="none">
                    <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" stroke="currentColor" stroke-width="1.8"/>
                    <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                  <svg *ngSwitchCase="'sellers'" viewBox="0 0 24 24" fill="none">
                    <path d="M3 7h18l-1 13H4L3 7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                    <path d="M8 7a4 4 0 0 1 8 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                  <svg *ngSwitchCase="'orders'" viewBox="0 0 24 24" fill="none">
                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Z" fill="currentColor" opacity="0.9"/>
                    <path d="M6 6h15l-2 9H8L6 6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                    <path d="M6 6H3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                  <svg *ngSwitchCase="'analytics'" viewBox="0 0 24 24" fill="none">
                    <path d="M4 19V5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M7 15l3-3 3 2 4-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg *ngSwitchCase="'settings'" viewBox="0 0 24 24" fill="none">
                    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" stroke-width="1.8"/>
                    <path d="M19.4 15a7.97 7.97 0 0 0 .1-1 7.97 7.97 0 0 0-.1-1l2-1.5-2-3.5-2.3 1a7.8 7.8 0 0 0-1.7-1L14 3h-4l-.8 2.9a7.8 7.8 0 0 0-1.7 1l-2.3-1-2 3.5L5.2 13a7.97 7.97 0 0 0-.1 1c0 .34.03.67.1 1l-2 1.5 2 3.5 2.3-1a7.8 7.8 0 0 0 1.7-1L10 21h4l.8-2.9a7.8 7.8 0 0 0 1.7-1l2.3 1 2-3.5-2-1.6Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
                  </svg>
                </span>
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
              <a routerLink="/dashboard/overview" class="breadcrumb-item">Dashboard</a>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item current">{{ getCurrentPageTitle() }}</span>
            </nav>
          </div>

          <div class="topbar-center">
            <div class="search-box">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"/>
              </svg>
              <input type="text" placeholder="Search orders, sellers or users...">
            </div>
          </div>
          
          <div class="topbar-right">
            <button class="theme-btn" type="button" (click)="toggleTheme()" [title]="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
              <svg *ngIf="!isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
              </svg>
              <svg *ngIf="isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="M4.93 4.93l1.41 1.41" />
                <path d="M17.66 17.66l1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="M6.34 17.66l-1.41 1.41" />
                <path d="M19.07 4.93l-1.41 1.41" />
              </svg>
            </button>

            <button class="notification-btn" type="button">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                <path d="M10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
              </svg>
              <span class="notification-badge">3</span>
            </button>

            <div class="user-chip" [title]="user?.email || ''" (click)="goToProfile()">
              <div class="user-chip-avatar">
                <img [src]="user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User') + '&background=14b8a6&color=fff'" [alt]="user?.name">
              </div>
              <div class="user-chip-info">
                <div class="user-chip-name">{{ user?.name || 'User' }}</div>
                <div class="user-chip-role">{{ user?.role || 'admin' }}</div>
              </div>
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    .admin-dashboard {
      display: flex;
      height: 100vh;
      background: var(--bg);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* ===========================
       SIDEBAR STYLES
       =========================== */
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #134e4a 0%, #0f172a 100%);
      border-right: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      position: relative;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
      filter: drop-shadow(0 4px 8px rgba(20, 184, 166, 0.22));
    }

    .logo-text {
      transition: opacity 0.3s;
    }

    .logo-text.hidden {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    .logo-text h2 {
      color: white;
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 2px 0;
      line-height: 1.2;
      letter-spacing: -0.3px;
    }

    .logo-text span {
      color: var(--muted);
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .toggle-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.10);
      color: #94a3b8;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border-color: rgba(255, 255, 255, 0.20);
      transform: scale(1.05);
    }

    /* Sidebar Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    .sidebar-nav ul {
      list-style: none;
      margin: 0;
      padding: 0 0.75rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.875rem 1rem;
      color: #cbd5e1;
      text-decoration: none;
      transition: all 0.2s;
      position: relative;
      border-radius: 8px;
      margin-bottom: 4px;
      cursor: pointer;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.08);
      color: white;
      transform: translateX(2px);
    }

    .nav-item.active {
      background: rgba(255, 255, 255, 0.10);
      color: white;
      box-shadow: none;
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 22px;
      background: var(--accent);
      border-radius: 0 4px 4px 0;
    }

    .nav-icon {
      width: 22px;
      height: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .nav-icon svg {
      width: 20px;
      height: 20px;
      display: block;
    }

    .nav-text {
      font-weight: 500;
      font-size: 0.9rem;
      white-space: nowrap;
      opacity: 1;
      transition: opacity 0.3s;
    }

    .sidebar.collapsed .nav-text {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    .nav-badge {
      background: var(--danger);
      color: white;
      font-size: 0.7rem;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      margin-left: auto;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
    }

    .sidebar.collapsed .nav-badge {
      display: none;
    }

    /* Sidebar Footer */
    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 1rem;
      opacity: 1;
      transition: opacity 0.3s;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
    }

    .sidebar.collapsed .user-profile {
      opacity: 0;
      height: 0;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      overflow: hidden;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-info p {
      margin: 0;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-name {
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-role {
      color: var(--muted);
      font-size: 0.75rem;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      padding: 0.75rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.22);
      color: var(--danger);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.34);
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
    }

    .logout-btn span {
      transition: opacity 0.3s;
    }

    .sidebar.collapsed .logout-btn span {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    /* ===========================
       MAIN CONTENT AREA
       =========================== */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ===========================
       TOPBAR
       =========================== */
    .topbar {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      position: sticky;
      top: 0;
      z-index: 40;
      gap: 1.25rem;
    }

    .topbar-left {
      flex: 1;
    }

    .topbar-center {
      flex: 1.2;
      display: flex;
      justify-content: center;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 0.25rem 0;
      letter-spacing: -0.5px;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .breadcrumb-item {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }

    .breadcrumb-item:hover:not(.current) {
      color: var(--text);
    }

    .breadcrumb-item.current {
      color: var(--accent);
      font-weight: 600;
    }

    .breadcrumb-separator {
      color: var(--border-2);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .notification-btn {
      position: relative;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--muted);
      padding: 0.625rem;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-btn:hover {
      background: var(--surface-2);
      border-color: var(--border-2);
      color: var(--text);
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    }

    .theme-btn {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--muted);
      padding: 0.625rem;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .theme-btn:hover {
      background: var(--surface-2);
      border-color: var(--border-2);
      color: var(--text);
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    }

    .notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--danger);
      color: white;
      font-size: 0.625rem;
      padding: 0.125rem 0.375rem;
      border-radius: 999px;
      font-weight: 600;
      min-width: 18px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.7rem 1rem;
      min-width: 360px;
      max-width: 520px;
      width: 100%;
      transition: all 0.2s;
    }

    .search-box:focus-within {
      background: var(--surface);
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.12);
    }

    .search-box svg {
      color: var(--muted);
      flex-shrink: 0;
    }

    .search-box input {
      border: none;
      background: none;
      outline: none;
      flex: 1;
      font-size: 0.9rem;
      color: var(--text);
      font-weight: 500;
    }

    .search-box input::placeholder {
      color: var(--muted);
      font-weight: 400;
    }

    .user-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 10px 6px 6px;
      border: 1px solid var(--border);
      background: var(--surface);
      border-radius: 14px;
      min-width: 200px;
      cursor: pointer;
    }

    .user-chip-avatar {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;
      background: var(--border);
    }

    .user-chip-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-chip-info {
      min-width: 0;
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }

    .user-chip-name {
      color: var(--text);
      font-size: 0.9rem;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-chip-role {
      color: var(--muted);
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-transform: capitalize;
    }

    /* ===========================
       CONTENT AREA
       =========================== */
    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      background: var(--bg);
    }

    .content-area::-webkit-scrollbar {
      width: 8px;
    }

    .content-area::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    .content-area::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    .content-area::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* ===========================
       RESPONSIVE DESIGN
       =========================== */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: -280px;
        z-index: 1000;
        height: 100vh;
        transition: left 0.3s ease;
      }

      .sidebar.open {
        left: 0;
        box-shadow: 4px 0 12px rgba(0, 0, 0, 0.15);
      }

      .main-content {
        margin-left: 0;
      }

      .topbar {
        padding: 1rem 1.5rem;
      }

      .search-box {
        min-width: 200px;
      }

      .topbar-center {
        display: none;
      }

      .content-area {
        padding: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .topbar {
        padding: 1rem;
        height: auto;
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .topbar-right {
        width: 100%;
        justify-content: space-between;
      }

      .search-box {
        min-width: 100%;
      }

      .user-chip {
        min-width: 0;
      }

      .page-title {
        font-size: 1.25rem;
      }

      .content-area {
        padding: 1rem;
      }
    }

    /* ===========================
       UTILITIES
       =========================== */
    .hidden {
      opacity: 0 !important;
      width: 0 !important;
      overflow: hidden !important;
    }
  `]
})
export class AdminDashboardComponent {
  sidebarCollapsed = false;
  user: any | null = null;
  isDarkMode = false;

  private readonly themeStorageKey = 'smartdarna_theme';

  menuItems = [
    { key: 'dashboard', label: 'Dashboard', route: '/dashboard/overview', exact: true },
    { key: 'products', label: 'Products', route: '/dashboard/products', exact: true },
    { key: 'users', label: 'Users', route: '/dashboard/users', exact: true },
    { key: 'sellers', label: 'Sellers', route: '/dashboard/sellers', exact: true, badge: '12' },
    { key: 'orders', label: 'Orders', route: '/dashboard/orders', exact: true, badge: '5' },
    { key: 'analytics', label: 'Analytics', route: '/dashboard/analytics', exact: true },
    { key: 'settings', label: 'Settings', route: '/dashboard/settings', exact: true }
  ];

  visibleMenuItems = [...this.menuItems];

  private readonly permissionByKey: Record<string, AdminPermission | null> = {
    dashboard: null,
    products: 'manage_products',
    users: null,
    sellers: 'manage_sellers',
    orders: 'manage_orders',
    analytics: 'view_analytics',
    settings: null
  };

  constructor(
    private authService: AuthService,
    private ngZone: NgZone,
    private permissionsService: SubAdminPermissionsService,
    private router: Router
  ) {
    this.initTheme();
    this.authService.currentUser.subscribe(user => {
      if (!user) {

        this.ngZone.run(() => {
          this.user = null;
          this.visibleMenuItems = [];
        });
        return;
      }

      const cachedProfile = this.authService.getUserSync();
      this.ngZone.run(() => {
        this.user = cachedProfile || {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.['name'] || user.email || 'User',
          role: user.user_metadata?.['role'] || 'admin',
          user_metadata: user.user_metadata
        };
      });

      void this.refreshVisibleMenuItems(this.user);

      void this.authService.getUser().then(profile => {
        this.ngZone.run(() => {
          this.user = profile;
        });

        void this.refreshVisibleMenuItems(profile);
      });
    });
  }

  private async refreshVisibleMenuItems(profile: any | null): Promise<void> {
    if (!profile) {
      this.ngZone.run(() => {
        this.visibleMenuItems = [];
      });
      return;
    }

    const isSuperAdmin = await this.permissionsService.isSuperAdmin(profile);
    if (isSuperAdmin) {
      this.ngZone.run(() => {
        this.visibleMenuItems = [...this.menuItems];
      });
      return;
    }

    const myPermissions = await this.permissionsService.getMyPermissions();
    const allowed = new Set<AdminPermission>(myPermissions);

    const filtered = this.menuItems.filter((item: any) => {
      if (item.key === 'dashboard') return true;
      if (item.key === 'users') return false;

      const required = this.permissionByKey[item.key];
      if (!required) return true;
      return allowed.has(required);
    });

    this.ngZone.run(() => {
      this.visibleMenuItems = filtered;
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleTheme() {
    this.applyTheme(!this.isDarkMode, true);
  }

  private initTheme() {
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

  private applyTheme(isDark: boolean, persist: boolean) {
    this.isDarkMode = isDark;
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
    }
    if (persist && typeof window !== 'undefined') {
      window.localStorage.setItem(this.themeStorageKey, isDark ? 'dark' : 'light');
    }
  }

  getCurrentPageTitle(): string {
    // Check if running in browser environment
    if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
      const currentRoute = window.location.pathname;
      if (currentRoute.includes('/dashboard/profile')) return 'Profile';
      const menuItem = this.menuItems.find(item => 
        currentRoute.includes(item.route) || 
        (item.route === '/dashboard/overview' && currentRoute === '/dashboard')
      );
      return menuItem ? menuItem.label : 'Dashboard';
    }
    return 'Dashboard';
  }

  goToProfile(): void {
    void this.router.navigate(['/dashboard/profile']);
  }

  async logout() {
    await this.authService.signOut();
    // Check if running in browser environment
    if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
      window.location.href = '/login';
    }
  }
}