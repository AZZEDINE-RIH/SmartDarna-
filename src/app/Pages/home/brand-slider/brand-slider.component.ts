import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Brand {
    name: string;
    logo: string;
}

@Component({
    selector: 'app-brand-slider',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './brand-slider.component.html',
    styleUrls: ['./brand-slider.component.css']
})
export class BrandSliderComponent {
    brands: Brand[] = [
        { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
        { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
        { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
        { name: 'Ring', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Ring_Logo.svg' },
        { name: 'Nest', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Nest_logo_2015.svg' },
        { name: 'Arlo', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Arlo_Technologies_logo.svg' },
        { name: 'Yale', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Yale_Lock_logo.svg' },
        { name: 'Ecobee', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Ecobee_logo.svg' },
        { name: 'Philips Hue', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Philips_logo_new.svg' },
        { name: 'TP-Link', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/89/TP-Link_logo.svg' },
        { name: 'Sonos', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Sonos_logo.svg' },
        { name: 'Samsung SmartThings', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' }
    ];
}
