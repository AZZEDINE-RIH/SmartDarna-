import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

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
}
