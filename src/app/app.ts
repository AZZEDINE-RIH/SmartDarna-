import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Navbar } from './core/navbar/navbar';
import { Footer } from './core/footer/footer';
import { WhatsappButtonComponent } from './shared/whatsapp-button/whatsapp-button.component';
import { ScrollTopComponent } from './shared/scroll-top/scroll-top.component';
import { CursorFollowComponent } from './shared/cursor-follow/cursor-follow.component';
import { DarkCursorComponent } from './shared/dark-cursor/dark-cursor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Navbar,
    Footer,
    WhatsappButtonComponent,
    ScrollTopComponent,
    CursorFollowComponent,
    DarkCursorComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  constructor(private router: Router, private elementRef: ElementRef) { }

  ngAfterViewInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Small delay to ensure view is rendered
      setTimeout(() => this.initScrollReveal(), 100);
    });

    // Initial check
    this.initScrollReveal();
  }

  private initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px'
    });

    const sections = this.elementRef.nativeElement.querySelectorAll('section, .section, .hero, .features-grid, .product-card');
    sections.forEach((section: any) => {
      section.classList.add('reveal');
      observer.observe(section);
    });
  }
}

