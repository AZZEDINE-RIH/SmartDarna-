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
    name: 'Azzdinne Rih',
    role: 'Director',
    photoUrl: '/assets/AzzdineRih.jpeg',
  };

  assistant: TeamPerson = {
    name: 'Sarah',
    role: 'Executive Assistant',
    photoUrl: ''
  };

  managerGroups: ManagerGroup[] = [
    {
      manager: { name: 'Sara Jamal', role: 'Manager', photoUrl: '/assets/SaraCom.jpg' },
      members: [
        { name: 'Hamza', role: 'Team Member', photoUrl: '/assets/Hamza.png' },
        { name: 'Samira', role: 'Team Member', photoUrl: '/assets/Samira.jpeg' },
        { name: 'Kamilia', role: 'Team Member', photoUrl: '/assets/Kamilia.jpg' },
      ],
    },
    {
      manager: { name: 'Soukaina Taleb', role: 'Manager', photoUrl: '/assets/SoukainaTaleb.jpg' },
      members: [
        { name: 'Aboubaker', role: 'Team Member', photoUrl: '/assets/JadAbou.jpg' },
        { name: 'Adam', role: 'Team Member', photoUrl: '/assets/Adam.png' },
        { name: 'Adile', role: 'Team Member', photoUrl: '/assets/Adile.png' },

        { name: 'Nassmine', role: 'Team Member', photoUrl: '/assets/Nassmine.png' },
      ],
    },
    {
      manager: { name: 'Ihssane EL Bouazzaoui', role: 'Manager', photoUrl: '/assets/IhssaneElBouazzaoui.jpg' },
      members: [
        { name: 'Jamal', role: 'Team Member', photoUrl: '/assets/Jamal.png' },

        { name: 'Said', role: 'Team Member', photoUrl: '/assets/said.png' },
      ],
    },
  ];
}
