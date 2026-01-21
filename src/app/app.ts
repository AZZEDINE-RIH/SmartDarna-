import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Dashboard } from "./User/dashboard/dashboard";
import { Navbar } from './User/navbar/navbar';
import { Sidebar } from './User/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Dashboard, Navbar, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('SmartDarna');
}
