import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sellers-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Sellers Management</h1>
        <p>Manage seller applications, approvals, and performance</p>
      </div>
      
      <div class="content-card">
        <div class="card-body">
          <div class="placeholder-content">
            <div class="placeholder-icon">🏪</div>
            <h3>Sellers Dashboard</h3>
            <p>Manage seller applications, monitor performance, and handle approvals</p>
            <div class="placeholder-stats">
              <div class="stat">
                <span class="stat-number">12</span>
                <span class="stat-label">Pending Applications</span>
              </div>
              <div class="stat">
                <span class="stat-number">156</span>
                <span class="stat-label">Active Sellers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.875rem;
      font-weight: 700;
      color: #1e293b;
    }

    .page-header p {
      margin: 0;
      color: #64748b;
      font-size: 1rem;
    }

    .content-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .card-body {
      padding: 3rem;
    }

    .placeholder-content {
      text-align: center;
      max-width: 400px;
      margin: 0 auto;
    }

    .placeholder-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .placeholder-content h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
    }

    .placeholder-content p {
      margin: 0 0 2rem 0;
      color: #64748b;
    }

    .placeholder-stats {
      display: flex;
      justify-content: center;
      gap: 3rem;
    }

    .stat {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #667eea;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
    }
  `]
})
export class SellersPageComponent {
  constructor() {}
}
