import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card">
      <div class="stat-icon" [ngClass]="iconClass">
        <i [class]="icon"></i>
      </div>
      <div class="stat-content">
        <h3>{{ title }}</h3>
        <div *ngIf="loading" class="spinner"></div>
        <div *ngIf="!loading && error" class="error">N/A</div>
        <div *ngIf="!loading && !error" class="value">{{ value | number }}</div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .stat-icon.blue { background: #e3f2fd; color: #1976d2; }
    .stat-icon.green { background: #e8f5e9; color: #2e7d32; }
    .stat-icon.purple { background: #f3e5f5; color: #7b1fa2; }
    .stat-content h3 { margin: 0; font-size: 0.875rem; color: #666; font-weight: 500; }
    .stat-content .value { margin: 0.25rem 0 0; font-size: 1.5rem; font-weight: 600; color: #333; }
    .spinner { width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #333; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class AdminStatCardComponent {
  @Input() title: string = '';
  @Input() value: number | null = 0;
  @Input() icon: string = '';
  @Input() iconClass: string = 'blue';
  @Input() loading: boolean = false;
  @Input() error: boolean = false;
}
