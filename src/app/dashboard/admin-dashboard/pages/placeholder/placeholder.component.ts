import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-container">
      <div class="content">
        <div class="icon-wrapper">
          <span class="material-icons">{{ icon }}</span>
        </div>
        <h2>{{ title }}</h2>
        <p>This module is currently under development.</p>
        <div class="status-badge">Coming Soon</div>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 400px;
      background: white;
      border-radius: 16px;
      border: 1px solid #f1f5f9;
      margin-top: 2rem;
    }

    .content {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .icon-wrapper {
      width: 80px;
      height: 80px;
      background: #f8fafc;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .icon-wrapper .material-icons {
      font-size: 40px;
      color: #94a3b8;
    }

    h2 {
      color: #1e293b;
      margin: 0;
      font-size: 1.5rem;
    }

    p {
      color: #64748b;
      margin: 0;
    }

    .status-badge {
      background: #e0f2fe;
      color: #0ea5e9;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
  `]
})
export class AdminPlaceholderComponent implements OnInit {
  title = 'Module';
  icon = 'construction';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data['title']) this.title = data['title'];
      if (data['icon']) this.icon = data['icon'];
    });
  }
}
