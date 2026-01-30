import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <div class="page-title">
        <h1>Dashboard Overview</h1>
      </div>

      <div class="search-bar">
        <span class="material-icons search-icon">search</span>
        <input type="text" placeholder="Search orders, sellers or users..." />
      </div>

      <div class="topbar-actions">
        <button class="icon-btn notification-btn">
          <span class="material-icons">notifications</span>
          <span class="badge"></span>
        </button>
        
        <div class="user-profile">
          <div class="avatar">
            {{ userInitials }}
          </div>
          <div class="user-info">
            <span class="name">{{ userName }}</span>
            <span class="role">{{ userRole }}</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 70px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .search-bar {
      display: flex;
      align-items: center;
      background: #f1f5f9;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      width: 400px;
      color: #64748b;
    }

    .search-icon {
      margin-right: 0.5rem;
      font-size: 20px;
    }

    .search-bar input {
      border: none;
      background: transparent;
      outline: none;
      width: 100%;
      color: #1e293b;
      font-size: 0.9rem;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .icon-btn {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      position: relative;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .badge {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-left: 1.5rem;
      border-left: 1px solid #e2e8f0;
    }

    .avatar {
      width: 36px;
      height: 36px;
      background: #e2e8f0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #475569;
      font-size: 0.9rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .name {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.9rem;
      line-height: 1.2;
    }

    .role {
      font-size: 0.75rem;
      color: #64748b;
    }
  `]
})
export class TopbarComponent {
  @Input() user: any;

  get userName(): string {
    return this.user?.name || 'Admin User';
  }

  get userRole(): string {
    return 'Super Admin';
  }

  get userInitials(): string {
    const name = this.userName;
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
