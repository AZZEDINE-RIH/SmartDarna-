import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BrandLogo {
    name: string;
    logo: string;
}

@Component({
    selector: 'app-brand-marquee',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="w-full bg-black h-14 border-y border-white/10 overflow-hidden relative z-40">
      
      <!-- Gradient Masks for Fade Effect -->
      <div class="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
      <div class="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

      <div class="flex h-full items-center whitespace-nowrap group hover:[animation-play-state:paused]">
        
        <!-- Content List 1 -->
        <div class="flex animate-[marquee_25s_linear_infinite] shrink-0 items-center justify-around min-w-full">
          @for (brand of brands(); track brand.name) {
            <div class="flex items-center justify-center px-12 opacity-70 transition-opacity duration-300 hover:opacity-100 cursor-pointer">
              <img 
                [src]="brand.logo" 
                [alt]="brand.name" 
                class="h-6 w-auto object-contain brightness-0 invert pointer-events-none" 
              />
            </div>
          }
        </div>

        <!-- Content List 2 (Duplicate for Seamless Loop) -->
        <div class="flex animate-[marquee_25s_linear_infinite] shrink-0 items-center justify-around min-w-full" aria-hidden="true">
          @for (brand of brands(); track brand.name) {
             <div class="flex items-center justify-center px-12 opacity-70 transition-opacity duration-300 hover:opacity-100 cursor-pointer">
              <img 
                [src]="brand.logo" 
                [alt]="brand.name" 
                class="h-6 w-auto object-contain brightness-0 invert pointer-events-none" 
              />
            </div>
          }
        </div>

      </div>
    </div>
  `,
    styles: [`
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-100%); }
    }
    /* Fallback if arbitrary value fails */
    .animate-\[marquee_25s_linear_infinite\] {
      animation: marquee 25s linear infinite;
    }
  `]
})
export class BrandMarqueeComponent {
    // Using simpleicons CDN for consistent, high-quality SVGs (matching original carousel)
    brands = signal<BrandLogo[]>([
        { name: 'Amazon', logo: 'https://cdn.simpleicons.org/amazon/232F3E' },
        { name: 'Google', logo: 'https://cdn.simpleicons.org/google/4285F4' },
        { name: 'Apple', logo: 'https://cdn.simpleicons.org/apple/000000' },
        { name: 'Samsung', logo: 'https://cdn.simpleicons.org/samsung/1428A0' },
        { name: 'Philips', logo: 'https://cdn.simpleicons.org/philips/0E5FD8' },
        { name: 'Ring', logo: 'https://cdn.simpleicons.org/ring/1C9FDA' },
        { name: 'Nest', logo: 'https://cdn.simpleicons.org/googlenest/00A4E4' },
        { name: 'Ecobee', logo: 'https://cdn.simpleicons.org/ecobee/6D4287' },
        // Adding hinted brands for completeness
        { name: 'Arlo', logo: 'https://cdn.simpleicons.org/arlo/000000' },
        { name: 'Yale', logo: 'https://cdn.simpleicons.org/yale/FFD100' },
        { name: 'Wyze', logo: 'https://cdn.simpleicons.org/wyze/2E3693' }
    ]);
}
