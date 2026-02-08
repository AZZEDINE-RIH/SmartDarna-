import { CommonModule } from '@angular/common';
import { Component, Input, ElementRef, ViewChild, HostListener, signal, computed } from '@angular/core';

export interface TeamPerson {
  name: string;
  role: string;
  photoUrl?: string;
}

@Component({
  selector: 'app-team-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-card.component.html',
  styleUrls: ['./team-card.component.css']
})
export class TeamCardComponent {
  @Input() person!: TeamPerson;
  @Input() size: 'director' | 'manager' | 'member' = 'member';
  @ViewChild('cardContainer') cardContainer!: ElementRef<HTMLDivElement>;

  // State signals for 3D effect
  rotationX = signal(0);
  rotationY = signal(0);
  isHovering = signal(false);
  
  // Computed transform for the main card
  cardTransform = computed(() => {
    const rX = this.rotationX();
    const rY = this.rotationY();
    return `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg) scale3d(1.05, 1.05, 1.05)`;
  });

  // Computed transform for the glare effect (moves opposite to card tilt)
  glareTransform = computed(() => {
    const rX = this.rotationX();
    const rY = this.rotationY();
    // Invert the rotation for the glare position
    return `translate(${rY * -4}%, ${rX * -4}%)`;
  });

  @HostListener('mousemove', ['$event'])
  handleMouseMove(event: MouseEvent) {
    if (!this.cardContainer) return;

    this.isHovering.set(true);
    
    const card = this.cardContainer.nativeElement;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to the center of the card
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    // Maximum tilt in degrees
    const MULTIPLIER = 15;

    // Calculate rotation
    const rotateY = (x / (rect.width / 2)) * MULTIPLIER;
    const rotateX = (y / (rect.height / 2)) * -MULTIPLIER;

    this.rotationX.set(rotateX);
    this.rotationY.set(rotateY);
  }

  @HostListener('mouseleave')
  handleMouseLeave() {
    this.isHovering.set(false);
    // Reset rotations to 0 when mouse leaves
    this.rotationX.set(0);
    this.rotationY.set(0);
  }
}
