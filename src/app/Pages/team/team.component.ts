import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TeamCardComponent, TeamPerson } from '../../shared/team-card/team-card.component';

interface ManagerGroup {
  manager: TeamPerson;
  members: TeamPerson[];
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, TeamCardComponent],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css'],
})
export class TeamComponent {
  director: TeamPerson = {
    name: 'Name',
    role: 'Director',
    photoUrl: '',
  };

  managerGroups: ManagerGroup[] = [
    {
      manager: { name: 'Sara Jamal', role: 'Manager', photoUrl: 'assets/images/sara-jamal.jpg' },
      members: [
        { name: 'Name', role: 'Team Member', photoUrl: '' },
        { name: 'Name', role: 'Team Member', photoUrl: '' },
        { name: 'Name', role: 'Team Member', photoUrl: '' },
      ],
    },
    {
      manager: { name: 'Name', role: 'Manager', photoUrl: '' },
      members: [
        { name: 'Name', role: 'Team Member', photoUrl: '' },
        { name: 'Name', role: 'Team Member', photoUrl: '' },
        { name: 'Name', role: 'Team Member', photoUrl: '' },
        { name: 'Name', role: 'Team Member', photoUrl: '' },
      ],
    },
    {
      manager: { name: 'Name', role: 'Manager', photoUrl: '' },
      members: [
        { name: 'Name', role: 'Team Member', photoUrl: '' },
        { name: 'Name', role: 'Team Member', photoUrl: '' },
      ],
    },
  ];
}
