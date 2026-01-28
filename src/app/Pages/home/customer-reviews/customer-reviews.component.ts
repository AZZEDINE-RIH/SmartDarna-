import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Review {
    id: number;
    name: string;
    location?: string;
    avatar: string;
    rating: number;
    text: string;
    date: string;
    isVerified: boolean;
}

@Component({
    selector: 'app-customer-reviews',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './customer-reviews.component.html',
    styleUrl: './customer-reviews.component.css'
})
export class CustomerReviewsComponent implements OnInit, OnDestroy {
    reviews: Review[] = [
        {
            id: 1,
            name: 'Sophia Williams',
            location: 'Casablanca',
            avatar: 'https://i.pravatar.cc/150?u=sophia',
            rating: 5,
            text: 'SmartDarna has completely transformed how I manage my home security. The interface is incredibly intuitive and perfectly responsive.',
            date: 'Jan 15, 2026',
            isVerified: true
        },
        {
            id: 2,
            name: 'Adam Mansouri',
            location: 'Marrakech',
            avatar: 'https://i.pravatar.cc/150?u=mansour',
            rating: 5,
            text: 'Technically superior products compared to what I found on other sites. The installation service was professional and very quick.',
            date: 'Jan 20, 2026',
            isVerified: true
        },
        {
            id: 3,
            name: 'Sarah Benjelloun',
            location: 'Rabat',
            avatar: 'https://i.pravatar.cc/150?u=sarah',
            rating: 4,
            text: 'I love the minimalist design of the hub. It blends perfectly with my living room decor while providing powerful automation features.',
            date: 'Jan 22, 2026',
            isVerified: true
        }
    ];

    currentIndex = 0;
    autoSlideInterval: any;
    showForm = false;

    // Touch support
    private touchStartX = 0;
    private touchEndX = 0;

    // New review form model
    newReview = {
        name: '',
        rating: 5,
        text: '',
        location: ''
    };

    ngOnInit() {
        this.startAutoSlide();
    }

    ngOnDestroy() {
        this.stopAutoSlide();
    }

    // Rating Calculations
    get averageRating(): string {
        const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / this.reviews.length).toFixed(1);
    }

    get totalReviewsCount(): number {
        return 1200 + this.reviews.length; // Mock base + actual
    }

    startAutoSlide() {
        this.stopAutoSlide();
        this.autoSlideInterval = setInterval(() => {
            this.next();
        }, 5000);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
        }
    }

    next() {
        const maxIndex = Math.max(0, this.reviews.length - this.getVisibleCards());
        this.currentIndex = this.currentIndex >= maxIndex ? 0 : this.currentIndex + 1;
    }

    prev() {
        const maxIndex = Math.max(0, this.reviews.length - this.getVisibleCards());
        this.currentIndex = this.currentIndex <= 0 ? maxIndex : this.currentIndex - 1;
    }

    goTo(index: number) {
        this.currentIndex = index;
        this.stopAutoSlide();
        this.startAutoSlide();
    }

    toggleForm() {
        this.showForm = !this.showForm;
        if (this.showForm) {
            this.stopAutoSlide();
        } else {
            this.startAutoSlide();
        }
    }

    submitReview() {
        if (this.newReview.name && this.newReview.text) {
            const review: Review = {
                id: Date.now(),
                name: this.newReview.name,
                location: this.newReview.location || 'Verified Buyer',
                avatar: `https://i.pravatar.cc/150?u=${this.newReview.name}`,
                rating: this.newReview.rating,
                text: this.newReview.text,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                isVerified: true
            };

            this.reviews.unshift(review);
            this.currentIndex = 0;

            // Reset form
            this.newReview = {
                name: '',
                rating: 5,
                text: '',
                location: ''
            };
            this.showForm = false;
            this.startAutoSlide();
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) { }

    // Swipe handlers
    @HostListener('touchstart', ['$event'])
    onTouchStart(event: TouchEvent) {
        this.touchStartX = event.changedTouches[0].screenX;
        this.stopAutoSlide();
    }

    @HostListener('touchend', ['$event'])
    onTouchEnd(event: TouchEvent) {
        this.touchEndX = event.changedTouches[0].screenX;
        this.handleSwipe();
        this.startAutoSlide();
    }

    private handleSwipe() {
        const threshold = 50;
        if (this.touchStartX - this.touchEndX > threshold) {
            this.next(); // Swipe Left -> Next
        } else if (this.touchEndX - this.touchStartX > threshold) {
            this.prev(); // Swipe Right -> Prev
        }
    }

    getRatingStars(rating: number): number[] {
        return Array(Math.floor(rating)).fill(0);
    }

    getVisibleCards(): number {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 1024) return 3;
            if (window.innerWidth >= 768) return 2;
        }
        return 1;
    }
}
