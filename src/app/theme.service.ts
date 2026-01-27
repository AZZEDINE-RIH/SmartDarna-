import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSignal = signal<boolean>(false);
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    // Check localStorage for saved theme preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        this.isDarkModeSignal.set(true);
        this.isDarkModeSubject.next(true);
        this.applyDarkMode();
      }
    }
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkModeSignal();
    this.isDarkModeSignal.set(newTheme);
    this.isDarkModeSubject.next(newTheme);

    if (newTheme) {
      this.applyDarkMode();
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', 'dark');
      }
    } else {
      this.applyLightMode();
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', 'light');
      }
    }
  }

  private applyDarkMode(): void {
    if (typeof window !== 'undefined') {
      document.body.classList.add('dark-theme');
    }
  }

  private applyLightMode(): void {
    if (typeof window !== 'undefined') {
      document.body.classList.remove('dark-theme');
    }
  }

  // Getter for components that need direct access
  get isDarkMode(): boolean {
    return this.isDarkModeSignal();
  }
}