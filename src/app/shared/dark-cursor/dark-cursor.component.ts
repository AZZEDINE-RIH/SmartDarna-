import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dark-cursor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dark-cursor.component.html',
  styleUrls: ['./dark-cursor.component.css']
})
export class DarkCursorComponent implements OnInit, OnDestroy {
  x = 0;
  y = 0;
  isVisible = false;

  private animationFrame: number | null = null;

  ngOnInit() {
    // Check if dark mode is active
    this.checkDarkMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      this.checkDarkMode();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isVisible) return;

    const targetX = event.clientX;
    const targetY = event.clientY;

    const animate = () => {
      this.x += (targetX - this.x) * 0.15;
      this.y += (targetY - this.y) * 0.15;

      if (Math.abs(targetX - this.x) > 0.1 || Math.abs(targetY - this.y) > 0.1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    animate();
  }

  @HostListener('document:mouseenter')
  onMouseEnter() {
    if (this.isDarkMode()) {
      this.isVisible = true;
    }
  }

  @HostListener('document:mouseleave')
  onMouseLeave() {
    this.isVisible = false;
  }

  private checkDarkMode() {
    this.isVisible = this.isDarkMode();
  }

  private isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark') || 
           document.documentElement.getAttribute('data-theme') === 'dark' ||
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
