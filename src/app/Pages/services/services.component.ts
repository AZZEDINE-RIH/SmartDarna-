import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  services = [
    {
      title: 'Consulting & Personalized Solutions',
      description: 'We provide tailored advice to help clients choose smart solutions that fit their needs, budget, and energy efficiency goals, with personalized pack options (Basic, Standard, Premium) to simplify choice.',
      icon: 'lightbulb'
    },
    {
      title: 'Installation & Maintenance',
      description: 'Professional installation, setup, and maintenance handled by our in-house team and trusted partners across multiple cities, ensuring fast, reliable, and high-quality service everywhere.',
      icon: 'wrench'
    },
    {
      title: 'Smart Products Sales',
      description: 'High-quality smart products designed to enhance comfort, security, and energy efficiency in your home.',
      icon: 'shopping-cart'
    },
    {
      title: 'Home Delivery',
      description: 'Fast and secure home delivery of smart products, with optional on-site installation.',
      icon: 'truck'
    },
    {
      title: 'Remote Assistance',
      description: 'Remote support for configuration, usage, troubleshooting, and energy optimization of smart systems.',
      icon: 'laptop'
    }
  ];
}
