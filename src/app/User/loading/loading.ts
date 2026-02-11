import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class Loading implements OnInit {
  progressPercentage: number = 0;
  progressCircumference: number = 2 * Math.PI * 54; // 2πr where r=54
  progressOffset: number = this.progressCircumference;
  isDarkMode: boolean = false;

  constructor(private themeService: ThemeService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Check dark mode
    this.isDarkMode = this.themeService.isDarkMode;
    
    // Start loading simulation
    this.simulateLoading();
  }

  simulateLoading() {
    const duration = 3000; // 3 seconds
    const steps = 100;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      this.progressPercentage = currentStep;
      this.progressOffset = this.progressCircumference - (currentStep / 100) * this.progressCircumference;
      
      // Force change detection to update UI
      this.cdr.detectChanges();

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);
  }
}
