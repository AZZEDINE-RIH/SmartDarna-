import { Component, ElementRef, AfterViewInit, ViewChildren, QueryList, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface Stat {
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
    currentValue: number;
}

@Component({
    selector: 'app-trusted-by',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './trusted-by.component.html',
    styleUrls: ['./trusted-by.component.css']
})
export class TrustedByComponent implements AfterViewInit, OnDestroy {
    stats: Stat[] = [
        { label: 'Installations', value: 500, prefix: '+', currentValue: 0 },
        { label: 'Happy Clients', value: 300, prefix: '+', currentValue: 0 },
        { label: 'Support', value: 24, suffix: '/7', currentValue: 0 },
        { label: 'Years Experience', value: 5, prefix: '+', currentValue: 0 }
    ];

    @ViewChildren('statCard') statCards!: QueryList<ElementRef>;
    private observer!: IntersectionObserver;
    private platformId = inject(PLATFORM_ID);

    constructor() { }

    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.setupIntersectionObserver();
        }
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startCounting();
                    this.observer.disconnect(); // Run only once
                }
            });
        }, options);

        if (this.statCards.first) {
            // Observe the section or the first card to trigger animation for all
            this.observer.observe(this.statCards.first.nativeElement.closest('.trusted-by-section'));
        }
    }

    startCounting() {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const interval = duration / steps;

        this.stats.forEach(stat => {
            const increment = stat.value / steps;
            let count = 0;

            const timer = setInterval(() => {
                count++;
                stat.currentValue = Math.min(Math.round(increment * count), stat.value);

                if (count >= steps) {
                    clearInterval(timer);
                    stat.currentValue = stat.value; // Ensure final value is exact
                }
            }, interval);
        });
    }

    ngOnDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}
