import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Service {
    icon: string;
    title: string;
    description: string;
    features: string[];
}

@Component({
    selector: 'app-services',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.css']
})
export class ServicesComponent {
    services: Service[] = [
        {
            icon: '🏠',
            title: 'Smart Home Consultation',
            description: 'Expert guidance to design your perfect smart home ecosystem.',
            features: [
                'Personalized home assessment',
                'Custom solution design',
                'Budget planning',
                'Product recommendations'
            ]
        },
        {
            icon: '🔧',
            title: 'Professional Installation',
            description: 'Certified technicians ensure seamless setup and integration.',
            features: [
                'Expert installation',
                'Device configuration',
                'Network optimization',
                'Quality assurance testing'
            ]
        },
        {
            icon: '📱',
            title: 'Smart Home Integration',
            description: 'Connect all your devices for unified control and automation.',
            features: [
                'Multi-device integration',
                'Automation setup',
                'Voice assistant configuration',
                'Scene programming'
            ]
        },
        {
            icon: '🛡️',
            title: 'Maintenance & Support',
            description: '24/7 technical support and ongoing maintenance services.',
            features: [
                'Round-the-clock support',
                'Software updates',
                'Troubleshooting',
                'Extended warranty options'
            ]
        }
    ];
}
