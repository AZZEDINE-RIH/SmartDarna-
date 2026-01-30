import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './User/navbar/navbar';
import { Sidebar } from './User/sidebar/sidebar';
import { ThemeService } from './theme.service';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Navbar, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isDarkMode: boolean = false;
  private themeSubscription?: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(
      (mode) => (this.isDarkMode = mode)
    );
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
  }

  protected readonly title = signal('SmartDarna');
}
