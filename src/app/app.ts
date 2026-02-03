import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
export class AppComponent { }

