import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="page-container"><h1>Analytics Dashboard</h1><p>View detailed analytics and reports</p></div>`,
  styles: [`.page-container{padding:2rem;}`]
})
export class AnalyticsPageComponent { constructor() {} }
