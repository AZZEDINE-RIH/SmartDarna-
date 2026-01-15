import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './Component/navbar/navbar';
import { Footer } from './Component/footer/footer';
import { ScrollTop} from './Component/scroll-top/scroll-top';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Navbar,
    Footer,
    ScrollTop
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {}

