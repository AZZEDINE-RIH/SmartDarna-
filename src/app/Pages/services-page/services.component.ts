import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


interface Service {
    icon: string;
    title: string;
    description: string;
}

interface ProcessStep {
    number: string;
    title: string;
    description: string;
    icon: string;
}

interface WhyChooseItem {
    icon: string;
    title: string;
    description: string;
}

@Component({
    selector: 'app-services',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.css']
})
export class ServicesComponent implements AfterViewInit {
    services: Service[] = [
        {
            icon: 'consultation',
            title: 'Smart Home Consultation',
            description: 'Expert guidance to design your perfect smart home ecosystem tailored to your lifestyle and budget.'
        },
        {
            icon: 'product',
            title: 'Product Selection & Advice',
            description: 'We help you choose the best compatible devices from top brands to ensure a seamless experience.'
        },
        {
            icon: 'installation',
            title: 'Professional Installation',
            description: 'Certified technicians ensure precise installation and optimal placement of all your smart devices.'
        },
        {
            icon: 'configuration',
            title: 'System Configuration & Setup',
            description: 'Complete network optimization, automation rules creation, and voice assistant integration.'
        },
        {
            icon: 'maintenance',
            title: 'Maintenance & Support',
            description: 'Ongoing technical support, firmware updates, and troubleshooting to keep your home running smoothly.'
        },
        {
            icon: 'aftersales',
            title: 'After-Sales Assistance',
            description: 'Dedicated customer service to answer questions and help you get the most out of your smart home.'
        }
    ];

    processSteps: ProcessStep[] = [
        {
            number: '01',
            title: 'Contact Us',
            description: 'Reach out to discuss your needs and schedule a consultation.',
            icon: 'contact'
        },
        {
            number: '02',
            title: 'Choose Solution',
            description: 'Select the perfect smart home package for your lifestyle.',
            icon: 'choose'
        },
        {
            number: '03',
            title: 'Installation',
            description: 'We install and configure everything to perfection.',
            icon: 'install'
        },
        {
            number: '04',
            title: 'Enjoy',
            description: 'Experience the comfort and convenience of your smart home.',
            icon: 'enjoy'
        }
    ];

    whyChooseItems: WhyChooseItem[] = [
        {
            icon: 'reliable',
            title: 'Reliable Products',
            description: 'We only partner with trusted brands known for quality and durability.'
        },
        {
            icon: 'certified',
            title: 'Certified Installation',
            description: 'Our team consists of trained and certified smart home professionals.'
        },
        {
            icon: 'pricing',
            title: 'Transparent Pricing',
            description: 'Clear, upfront quotes with no hidden fees or surprises.'
        },
        {
            icon: 'support',
            title: 'Ongoing Support',
            description: 'We are here for you long after the installation is complete.'
        }
    ];

    ngAfterViewInit() {
        this.setupScrollAnimation();
    }

    private setupScrollAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        const hiddenElements = document.querySelectorAll('.reveal');
        hiddenElements.forEach((el) => observer.observe(el));
    }
}