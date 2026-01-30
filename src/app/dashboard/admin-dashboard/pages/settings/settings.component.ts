import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="page-container"><h1>Settings</h1><p>Configure system settings and preferences</p></div>`,
  styles: [`.page-container{padding:2rem;}`]
})
export class SettingsPageComponent { constructor() {} }
