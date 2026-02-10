import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brand-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-carousel.component.html',
  styleUrls: ['./brand-carousel.component.css']
})
export class BrandCarouselComponent {
  brands = [
    { name: 'Amazon', logo: 'https://cdn.simpleicons.org/amazon/0ea5e9' },
    { name: 'Google', logo: 'https://cdn.simpleicons.org/google/0ea5e9' },
    { name: 'Apple', logo: 'https://cdn.simpleicons.org/apple/0ea5e9' },
    { name: 'Samsung SmartThings', logo: 'https://cdn.simpleicons.org/smartthings/0ea5e9' },
    { name: 'Philips Hue', logo: 'https://imgs.search.brave.com/BzW6o3jsVd6MuLsp9vKBvrHrXKRd3xueCjIK0tTnUgU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c2lnbmlmeS5jb20v/Y29udGVudC9kYW0v/c2lnbmlmeS9lbi11/cy9sb2dvL3BoaWxp/cHMtbG9nby5wbmc' },
    { name: 'Ring', logo: 'https://cdn.simpleicons.org/ring/0ea5e9' },
    { name: 'Ecobee', logo: 'https://cdn.simpleicons.org/ecobee/0ea5e9' },
    { name: 'Yale', logo: 'https://cdn.simpleicons.org/yale/0ea5e9' },
     { name: 'Google', logo: 'https://cdn.simpleicons.org/google/0ea5e9' },
    { name: 'Apple', logo: 'https://cdn.simpleicons.org/apple/0ea5e9' },
    { name: 'Samsung SmartThings', logo: 'https://cdn.simpleicons.org/smartthings/0ea5e9' },
    { name: 'Philips Hue', logo: 'https://cdn.simpleicons.org/philipshue/0ea5e9' },
    { name: 'Ring', logo: 'https://cdn.simpleicons.org/ring/0ea5e9' },
    { name: 'Nest', logo: 'https://cdn.simpleicons.org/googlenest/0ea5e9' },
    { name: 'Ecobee', logo: 'https://cdn.simpleicons.org/ecobee/0ea5e9' },
    { name: 'Yale', logo: 'https://cdn.simpleicons.org/yale/0ea5e9' }
  ];
}