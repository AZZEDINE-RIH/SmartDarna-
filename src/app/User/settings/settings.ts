import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-settings',
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class SettingsComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  private themeSub!: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeSub = this.themeService.isDarkMode$.subscribe(
      (value: boolean) => (this.isDarkMode = value)
    );
  }

  ngOnDestroy(): void {
    this.themeSub.unsubscribe();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  saveSettings(): void {
    // Save settings logic here
    console.log('Settings saved');
  }
}
