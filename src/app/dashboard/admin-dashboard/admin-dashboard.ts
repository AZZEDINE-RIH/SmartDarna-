import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, LoggedInUser } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  standalone: true
})
export class AdminDashboardComponent {
  user: LoggedInUser | null = null;

  constructor(private authService: AuthService) {
    this.user = this.authService.getUser();
  }
}
