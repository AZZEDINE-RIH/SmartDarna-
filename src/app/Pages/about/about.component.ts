import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, AfterViewInit {
    private countersAnimated = false;

    ngOnInit() {
        // Component initialization
    }

    ngAfterViewInit() {
        this.setupCounterAnimation();
        this.setupScrollAnimation();
    }

    private setupCounterAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.countersAnimated) {
                    this.animateCounters();
                    this.countersAnimated = true;
                }
            });
        }, {
            threshold: 0.5
        });

        const statisticsSection = document.querySelector('.statistics-section');
        if (statisticsSection) {
            observer.observe(statisticsSection);
        }
    }

    private setupScrollAnimation() {
        console.log('🔧 Setting up scroll animation');
        
        const reveals = document.querySelectorAll(".stat-item");
        console.log('📊 Found stat items:', reveals.length);

        const observer = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    console.log('👁️ Entry:', entry.isIntersecting, entry.target);
                    
                    if (entry.isIntersecting) {
                        console.log('✅ Element visible, removing classes:', entry.target.classList);
                        entry.target.classList.remove("opacity-0", "translate-y-8");
                        console.log('➕ Adding classes:', "opacity-100", "translate-y-0");
                        entry.target.classList.add("opacity-100", "translate-y-0");
                        console.log('🔒 Unobserving element');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.15
            }
        );

        reveals.forEach(el => {
            console.log('👀 Observing element:', el);
            observer.observe(el);
        });
    }

    private animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-target]');
        
        counters.forEach((counter) => {
            const target = parseInt(counter.getAttribute('data-target') || '0');
            const suffix = counter.getAttribute('data-suffix') || '';
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                
                if (current < target) {
                    counter.textContent = Math.floor(current) + suffix;
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + suffix;
                }
            };

            requestAnimationFrame(updateCounter);
        });
    }
}
