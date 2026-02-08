import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="logo-container">
        <div class="logo-icon">
          <span class="material-icons">hub</span>
        </div>
        <div class="logo-text">
          <h2>SmartDarna</h2>
          <span class="subtitle">SUPER ADMIN</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li *ngFor="let item of menuItems">
            <a [routerLink]="item.route" routerLinkActive="active" [routerLinkActiveOptions]="{exact: item.exact}">
              <span class="material-icons">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <a href="#" class="nav-item">
          <span class="material-icons">help_outline</span>
          Help Center
        </a>
        <button (click)="logout()" class="logout-btn">
          <span class="material-icons">logout</span>
          Logout
        </button>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .sidebar {
      background-color: #1a222c;
      color: #94a3b8;
      height: 100vh;
      width: 260px;
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      border-right: 1px solid #2d3748;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 0.5rem 2rem 0.5rem;
      margin-bottom: 1rem;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .logo-text h2 {
      color: white;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
      line-height: 1.2;
    }

    .subtitle {
      font-size: 0.7rem;
      color: #64748b;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .sidebar-nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .sidebar-nav a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.75rem 1rem;
      color: #94a3b8;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s ease;
      font-weight: 500;
    }

    .sidebar-nav a:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: #e2e8f0;
    }

    .sidebar-nav a.active {
      background: linear-gradient(90deg, rgba(14, 165, 233, 0.15) 0%, rgba(14, 165, 233, 0.05) 100%);
      color: #0ea5e9;
      border-left: 3px solid #0ea5e9;
    }

    .sidebar-nav a .material-icons {
      font-size: 20px;
    }

    .sidebar-footer {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid #2d3748;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-item, .logout-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.75rem 1rem;
      color: #94a3b8;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s ease;
      background: none;
      border: none;
      width: 100%;
      cursor: pointer;
      font-size: 1rem;
      font-family: inherit;
      font-weight: 500;
    }

    .logout-btn {
      color: #ef4444;
    }

    .logout-btn:hover {
      background-color: rgba(239, 68, 68, 0.1);
    }
  `]
})
export class SidebarComponent {
  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard/overview', exact: true },
    { label: 'Products', icon: 'inventory_2', route: '/dashboard/products', exact: true },
    { label: 'Users', icon: 'people', route: '/dashboard/users', exact: true },
    { label: 'Sellers', icon: 'store', route: '/dashboard/sellers', exact: true },
    { label: 'Orders', icon: 'shopping_cart', route: '/dashboard/orders', exact: true },
    { label: 'Settings', icon: 'settings', route: '/dashboard/settings', exact: true },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
