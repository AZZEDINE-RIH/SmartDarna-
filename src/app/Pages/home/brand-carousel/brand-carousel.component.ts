import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BrandLogo {
  name: string;
  logo: string;
}

@Component({
  selector: 'app-brand-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-carousel.component.html',
  styleUrls: ['./brand-carousel.component.css'],
})
export class BrandCarouselComponent {
  isPaused = signal(false);

  brands = signal<BrandLogo[]>([
    { name: 'Amazon', logo: 'https://cdn.simpleicons.org/amazon/232F3E' },
    { name: 'Google', logo: 'https://cdn.simpleicons.org/google/4285F4' },
    { name: 'Apple', logo: 'https://cdn.simpleicons.org/apple/000000' },
    { name: 'Samsung', logo: 'https://cdn.simpleicons.org/samsung/1428A0' },
    { name: 'Philips', logo: 'https://cdn.simpleicons.org/philips/0E5FD8' },
    { name: 'Ring', logo: 'https://cdn.simpleicons.org/ring/1C9FDA' },
    { name: 'Nest', logo: 'https://cdn.simpleicons.org/googlenest/00A4E4' },
    { name: 'Ecobee', logo: 'https://cdn.simpleicons.org/ecobee/6D4287' },
  ]);
}
