import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cursor-follow',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cursor-follow" [style.transform]="transform"></div>
  `,
  styleUrls: ['./cursor-follow.component.css']
})
export class CursorFollowComponent implements OnInit, OnDestroy {
  transform = 'translate(0, 0)';
  currentX = 0;
  currentY = 0;
  targetX = 0;
  targetY = 0;
  animationId: number | null = null;

  ngOnInit(): void {
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.targetX = event.clientX;
    this.targetY = event.clientY;
  }

  private animate(): void {
    // Smooth trailing effect with easing
    const easing = 0.15;
    this.currentX += (this.targetX - this.currentX) * easing;
    this.currentY += (this.targetY - this.currentY) * easing;

    this.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}
