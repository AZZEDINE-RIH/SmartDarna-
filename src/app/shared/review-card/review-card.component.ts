import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Review {
    id: string;
    customerName: string;
    rating: number;
    comment: string;
    date?: string;
    avatar?: string;
}

@Component({
    selector: 'app-review-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './review-card.component.html',
    styleUrls: ['./review-card.component.css']
})
export class ReviewCardComponent {
    @Input() review!: Review;


    getStars(): number[] {
        return Array(5).fill(0).map((_, i) => i);
    }

    getInitials(name: string): string {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }
}
