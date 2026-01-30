import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="topbar">
      <div class="topbar-left">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search orders, sellers or users..."
          [(ngModel)]="searchQuery"
          (keyup)="onSearch()">
        <span class="search-icon">🔍</span>
      </div>

      <div class="topbar-right">
        <div class="notification-icon">
          <span class="icon">🔔</span>
          <span class="badge">3</span>
        </div>

        <div class="user-profile">
          <div class="avatar">JW</div>
          <div class="user-info">
            <p class="user-name">James Wilson</p>
            <p class="user-role">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fff;
      padding: 15px 30px;
      border-bottom: 1px solid #e8e8e8;
      position: fixed;
      top: 0;
      left: 200px;
      right: 0;
      height: 60px;
      z-index: 100;
    }

    .topbar-left {
      flex: 1;
      max-width: 500px;
      position: relative;
    }

    .search-input {
      width: 100%;
      padding: 10px 35px 10px 15px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 13px;
      background: #f5f5f5;
      transition: all 0.3s ease;
    }

    .search-input:focus {
      outline: none;
      background: #fff;
      border-color: #00d4ff;
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    }

    .search-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
      color: #999;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 25px;
      margin-left: 30px;
    }

    .notification-icon {
      position: relative;
      cursor: pointer;
      font-size: 20px;
      transition: transform 0.3s ease;
    }

    .notification-icon:hover {
      transform: scale(1.1);
    }

    .notification-icon .badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #ff6b6b;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 6px;
      transition: background 0.3s ease;
    }

    .user-profile:hover {
      background: #f0f0f0;
    }

    .avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 14px;
    }

    .user-info p {
      margin: 0;
      line-height: 1.3;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }

    .user-role {
      font-size: 11px;
      color: #999;
    }

    @media (max-width: 768px) {
      .topbar {
        left: 0;
        padding: 10px 15px;
      }

      .topbar-left {
        max-width: 250px;
      }

      .search-input {
        font-size: 12px;
      }

      .topbar-right {
        gap: 15px;
        margin-left: 10px;
      }

      .user-info {
        display: none;
      }
    }
  `]
})
export class TopbarComponent {
  searchQuery: string = '';

  onSearch() {
    if (this.searchQuery.length > 0) {
      console.log('Search:', this.searchQuery);
      // TODO: Implement search logic
    }
  }
}
