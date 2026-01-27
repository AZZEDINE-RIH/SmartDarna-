import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSignal = signal<boolean>(false);
  isDarkMode = computed(() => this.isDarkModeSignal());

  constructor() {
    // Check localStorage for saved theme preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        this.isDarkModeSignal.set(true);
        this.applyDarkMode();
      }
    }
  }

  toggleTheme(): void {
    this.isDarkModeSignal.update(current => !current);
    const newTheme = this.isDarkModeSignal();

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
      document.body.classList.add('dark-mode');
    }
  }

  private applyLightMode(): void {
    if (typeof window !== 'undefined') {
      document.body.classList.remove('dark-mode');
    }
  }
}