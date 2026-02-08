import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesComponent } from './services.component';

@Component({
  selector: 'app-services-demo',
  standalone: true,
  imports: [CommonModule, ServicesComponent],
  templateUrl: './services-demo.component.html',
  styleUrl: './services-demo.component.css'
})
export class ServicesDemoComponent {
  companyName = 'Smart Darna';
  tagline = 'Transforming Homes with Smart Technology';
}
