import { Component, ChangeDetectionStrategy } from '@angular/core';
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
}

@Component({
    selector: 'app-customer-reviews',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reviews.component.html',
    styleUrls: ['./reviews.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerReviewsComponent {
    reviews: Review[] = [
        {
            id: 1,
            name: 'Sophia Rodriguez',
            location: 'Casablanca',
            avatar: 'https://i.pravatar.cc/150?u=sophia',
            rating: 5,
            text: 'Aurum has transformed my signature scent. The craftsmanship is unparalleled.',
            date: 'Jan 15, 2026'
        },
        {
            id: 2,
            name: 'Marcus Chen',
            location: 'Marrakech',
            avatar: 'https://i.pravatar.cc/150?u=marcus',
            rating: 5,
            text: 'Every note tells a story. This fragrance is pure poetry in a bottle.',
            date: 'Jan 20, 2026'
        },
        {
            id: 3,
            name: 'Isabella Thompson',
            location: 'Rabat',
            avatar: 'https://i.pravatar.cc/150?u=isabella',
            rating: 5,
            text: 'The longevity and depth of Nocturne is remarkable. Worth every moment of anticipation.',
            date: 'Jan 22, 2026'
        }
    ];

    newReview = {
        name: '',
        rating: 5,
        text: ''
    };

    get visibleReviews(): Review[] {
        return this.reviews.slice(0, 3);
    }

    submitReview() {
        if (this.newReview.name && this.newReview.text) {
            const review: Review = {
                id: Date.now(),
                name: this.newReview.name,
                avatar: `https://i.pravatar.cc/150?u=${this.newReview.name}`,
                rating: this.newReview.rating,
                text: this.newReview.text,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            };

            this.reviews.unshift(review);

            // Reset form
            this.newReview = {
                name: '',
                rating: 5,
                text: ''
            };
        }
    }

    getRatingStars(rating: number): number[] {
        return Array(Math.floor(rating)).fill(0);
    }
}
