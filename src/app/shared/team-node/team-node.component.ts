import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, forwardRef, Input, OnDestroy } from '@angular/core';
import { TeamCardComponent, TeamPerson } from '../team-card/team-card.component';

export interface TeamTreeNode extends TeamPerson {
  children?: TeamTreeNode[];
}

@Component({
  selector: 'app-team-node',
  standalone: true,
  imports: [CommonModule, TeamCardComponent, forwardRef(() => TeamNodeComponent)],
  templateUrl: './team-node.component.html',
  styleUrls: ['./team-node.component.css'],
  host: {
    '[class.level-0]': 'level === 0',
    '[class.level-1]': 'level === 1',
    '[class.level-2]': 'level === 2',
  },
})
export class TeamNodeComponent implements AfterViewInit, OnDestroy {
  @Input() node!: TeamTreeNode;
  @Input() level: 0 | 1 | 2 = 2;

  private io?: IntersectionObserver;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.io?.disconnect();

    this.io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          this.host.nativeElement.classList.add('active');
          this.io?.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -10% 0px' }
    );

    this.io.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }

  get size(): 'director' | 'manager' | 'member' {
    if (this.level === 0) return 'director';
    if (this.level === 1) return 'manager';
    return 'member';
  }

  get nextLevel(): 0 | 1 | 2 {
    return (Math.min(2, this.level + 1) as 0 | 1 | 2);
  }
}
