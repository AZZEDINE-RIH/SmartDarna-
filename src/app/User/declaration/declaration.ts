import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { ThemeService } from '../../theme.service';
import { NewDeclarationFormComponent } from "./new-declaration-form/new-declaration-form"; 

@Component({
  selector: 'app-declaration',
  standalone: true,
  imports: [CommonModule, NewDeclarationFormComponent],
  templateUrl: './declaration.html',
  styleUrl: './declaration.css',
})
export class Declaration implements OnInit, OnDestroy {

  isDarkMode = false;
  private themeSubscription!: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(
      (isDark) => {
        this.isDarkMode = isDark;
      }
    );
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
