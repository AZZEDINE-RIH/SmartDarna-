import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // Mock user for simulation
    private mockUser: User = {
        id: 'u123',
        name: 'Soukaina Test',
        email: 'test@smartdarna.ma',
        phone: '+212 600 123 456'
    };

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private isLoggedInSubject = new BehaviorSubject<boolean>(false);
    public isLoggedIn$ = this.isLoggedInSubject.asObservable();

    constructor() {
        // specific check for persisted session if needed in future
        const savedUser = localStorage.getItem('smartdarna_user');
        if (savedUser) {
            this.login(JSON.parse(savedUser));
        }
    }

    login(user: User = this.mockUser): void {
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
        localStorage.setItem('smartdarna_user', JSON.stringify(user));
    }

    logout(): void {
        this.currentUserSubject.next(null);
        this.isLoggedInSubject.next(false);
        localStorage.removeItem('smartdarna_user');
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    isAuthenticated(): boolean {
        return this.isLoggedInSubject.value;
    }
}
