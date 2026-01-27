import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private themeService: ThemeService;
  isDarkMode = signal(false);

  constructor(themeService: ThemeService) {
    this.themeService = themeService;

    // Use effect to react to theme changes
    effect(() => {
      const isDark = this.themeService.isDarkMode();
      this.isDarkMode.set(isDark);
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
