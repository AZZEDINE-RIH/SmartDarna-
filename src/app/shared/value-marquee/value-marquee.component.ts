import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-value-marquee',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-black h-10 overflow-hidden relative z-50 border-b border-white/5">
      
      <!-- Gradient Masks for Fade Effect -->
      <div class="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
      <div class="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

      <div class="flex h-full items-center whitespace-nowrap group hover:[animation-play-state:paused]">
        
        <!-- content (Duplicate for seamless loop) -->
        <div class="flex animate-[marquee_20s_linear_infinite] shrink-0 items-center">
          @for (item of items; track item.text) {
             <div class="flex items-center px-8">
              <span class="text-cyan-400 mr-2" [innerHTML]="item.icon"></span>
              <span class="text-white text-xs font-bold tracking-widest uppercase">{{ item.text }}</span>
              <!-- Optional Separator -->
              <!-- <span class="mx-6 text-gray-700 select-none">•</span> -->
            </div>
          }
        </div>

        <div class="flex animate-[marquee_20s_linear_infinite] shrink-0 items-center" aria-hidden="true">
          @for (item of items; track item.text) {
             <div class="flex items-center px-8">
              <span class="text-cyan-400 mr-2" [innerHTML]="item.icon"></span>
              <span class="text-white text-xs font-bold tracking-widest uppercase">{{ item.text }}</span>
              <!-- Optional Separator -->
             <!-- <span class="mx-6 text-gray-700 select-none">•</span> -->
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
    /* Ensure the animation class works if tailwind arbitrary value fails or isn't parsed */
    .animate-\[marquee_20s_linear_infinite\] {
        animation: marquee 20s linear infinite;
    }
  `]
})
export class ValueMarqueeComponent {
  items = [
    {
      text: 'Free Shipping Nationwide',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>' // Truck/Shipping icon
    },
    {
      text: '2-Year Official Warranty',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>' // Shield icon
    },
    {
      text: '24/7 Expert Support',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>' // Chat/Support icon
    },
    {
      text: '100% Secure Payment',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' // Lock icon
    },
    {
      text: '30-Day Money-Back Guarantee',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>' // Dollar/Money icon
    }
  ];
}
