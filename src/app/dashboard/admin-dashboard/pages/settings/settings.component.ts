import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>Settings</h1>
      <p>Configure dashboard and platform settings.</p>
    </div>
    <div class="content-placeholder">
      <p>Settings interface coming soon.</p>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #0f172a; }
    .page-header p { color: #64748b; margin-top: 0.5rem; }
    .content-placeholder { 
      padding: 3rem; 
      background: white; 
      border-radius: 12px; 
      text-align: center;
      color: #94a3b8;
      border: 1px dashed #e2e8f0;
    }
  `]
})
export class AdminSettingsComponent {}
