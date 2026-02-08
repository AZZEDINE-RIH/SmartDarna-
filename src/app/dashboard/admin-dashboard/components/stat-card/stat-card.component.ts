import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-stat-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="stat-card" [class]="'stat-card-' + (color || 'default')">
      <div *ngIf="!loading" class="stat-card-content">
        <div class="stat-header">
          <span class="stat-icon">{{ icon }}</span>
          <span class="stat-change" [class]="changeType">{{ change }}</span>
        </div>

        <div class="stat-content">
          <p class="stat-label">{{ label }}</p>
          <h3 class="stat-value">
            <span *ngIf="isCurrency">{{ value | currency }}</span>
            <span *ngIf="!isCurrency">{{ formatValue(value) }}</span>
          </h3>
        </div>

        <p class="stat-period">{{ period }}</p>
      </div>

      <div *ngIf="loading" class="stat-loading">
        <div class="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      border: 1px solid #e8e8e8;
      transition: all 0.3s ease;
      min-height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .stat-card-content {
      width: 100%;
    }

    .stat-card-default {
      border-left: 4px solid #667eea;
    }

    .stat-card-cyan {
      border-left: 4px solid #00d4ff;
    }

    .stat-card-green {
      border-left: 4px solid #2dce89;
    }

    .stat-card-orange {
      border-left: 4px solid #f39c12;
    }

    .stat-card-red {
      border-left: 4px solid #ff6b6b;
    }

    .stat-card-blue {
      border-left: 4px solid #667eea;
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .stat-icon {
      font-size: 28px;
      opacity: 0.8;
    }

    .stat-change {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .stat-change.positive {
      background: rgba(45, 206, 137, 0.1);
      color: #2dce89;
    }

    .stat-change.negative {
      background: rgba(255, 107, 107, 0.1);
      color: #ff6b6b;
    }

    .stat-change.neutral {
      background: rgba(255, 165, 0, 0.1);
      color: #ffa500;
    }

    .stat-content {
      margin-bottom: 10px;
    }

    .stat-label {
      margin: 0;
      font-size: 13px;
      color: #666;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      margin: 8px 0 0 0;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .stat-period {
      margin: 0;
      font-size: 12px;
      color: #999;
    }

    .stat-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .loading-spinner {
      width: 30px;
      height: 30px;
      border: 3px solid #e8e8e8;
      border-top: 3px solid #00d4ff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .stat-loading p {
      color: #999;
      font-size: 12px;
      margin: 0;
    }

    @media (max-width: 768px) {
      .stat-card {
        padding: 15px;
      }

      .stat-icon {
        font-size: 24px;
      }

      .stat-value {
        font-size: 22px;
      }
    }
  `]
})
export class DashboardStatCardComponent {
  @Input() label: string = '';
  @Input() value: number | null = 0;
  @Input() icon: string = '📊';
  @Input() change: string = '+12%';
  @Input() changeType: string = 'positive'; // positive, negative, neutral
  @Input() period: string = 'from last month';
  @Input() color: string = 'default';
  @Input() loading: boolean = false;
  @Input() isCurrency: boolean = false;

  formatValue(value: number | null): string {
    if (value === null || value === undefined) {
      return '0';
    }
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    if (value > 100) {
      return value.toLocaleString();
    }
    return value.toString();
  }
}
