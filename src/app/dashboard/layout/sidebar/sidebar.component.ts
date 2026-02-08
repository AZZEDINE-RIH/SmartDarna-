import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">💼</div>
          <div class="logo-text">
            <h1>SmartDarna</h1>
            <p>SUPER ADMIN</p>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a 
          routerLink="/dashboard/overview" 
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          class="nav-item">
          <span class="icon">📊</span>
          <span class="label">Dashboard</span>
        </a>

        <a 
          routerLink="/dashboard/products" 
          routerLinkActive="active"
          class="nav-item">
          <span class="icon">📦</span>
          <span class="label">Products</span>
        </a>

        <a 
          routerLink="/dashboard/sellers" 
          routerLinkActive="active"
          class="nav-item">
          <span class="icon">🏪</span>
          <span class="label">Sellers</span>
        </a>

        <a 
          routerLink="/dashboard/orders" 
          routerLinkActive="active"
          class="nav-item">
          <span class="icon">🛒</span>
          <span class="label">Orders</span>
        </a>

        <a 
          routerLink="/dashboard/users" 
          routerLinkActive="active"
          class="nav-item">
          <span class="icon">👥</span>
          <span class="label">Users</span>
        </a>

        <a 
          routerLink="/dashboard/settings" 
          routerLinkActive="active"
          class="nav-item">
          <span class="icon">⚙️</span>
          <span class="label">Settings</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="help-center">
          <span class="icon">❓</span>
          <span class="label">Help Center</span>
        </div>
        <button class="logout-btn" (click)="logout()">
          <span class="icon">🚪</span>
          <span class="label">Logout</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 200px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
      padding: 20px 0;
      height: 100vh;
      overflow-y: auto;
      position: fixed;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: column;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }

    .logo-icon {
      font-size: 28px;
    }

    .logo-text h1 {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .logo-text p {
      margin: 0;
      font-size: 10px;
      color: #888;
      text-transform: uppercase;
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 0;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      color: #a0a0a0;
      text-decoration: none;
      font-size: 13px;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;
      position: relative;
    }

    .nav-item:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
    }

    .nav-item.active {
      color: #00d4ff;
      border-left-color: #00d4ff;
      background: rgba(0, 212, 255, 0.05);
    }

    .nav-item .icon {
      font-size: 18px;
      width: 20px;
      text-align: center;
    }

    .nav-item .label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .help-center,
    .logout-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      color: #a0a0a0;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 13px;
      text-align: left;
      transition: all 0.3s ease;
      width: 100%;
    }

    .help-center:hover,
    .logout-btn:hover {
      color: #ff6b6b;
    }

    .help-center .icon,
    .logout-btn .icon {
      font-size: 18px;
      width: 20px;
      text-align: center;
    }

    /* Scrollbar styling */
    .sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    .sidebar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `]
})
export class SidebarComponent {
  constructor(private router: Router) {}

  logout() {
    // TODO: Implement logout logic
    console.log('Logout clicked');
    // this.router.navigate(['/login']);
  }
}
