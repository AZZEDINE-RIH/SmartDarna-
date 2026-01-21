import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, LoggedInUser } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  standalone: true
})
export class HomeComponent {
  user: LoggedInUser | null = null;

  constructor(private authService: AuthService) {
    this.user = this.authService.getUser();
  }
}
