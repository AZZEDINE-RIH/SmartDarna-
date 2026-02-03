import { CommonModule } from '@angular/common';
import { Component, Renderer2, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-scroll-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scroll-top.component.html',
  styleUrls: ['./scroll-top.component.css']
})
export class ScrollTopComponent {
  isVisible = false;
  scrollProgress = 0;
  circumference = 2 * Math.PI * 26; // radius = 26

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentScroll = window.pageYOffset;
    
    this.scrollProgress = scrollHeight > 0 ? (currentScroll / scrollHeight) * 100 : 0;
    this.isVisible = currentScroll > 300;
  }

  get dashOffset(): number {
    return this.circumference - (this.scrollProgress / 100) * this.circumference;
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
