import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Payment } from './Payment/payment';
import { Store } from './Store/store';
import { NotFound } from "./Not-found/not-found";

@Component({
  selector: 'app-root',
  imports: [Store, Payment, NotFound, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('smartDarna');
}
