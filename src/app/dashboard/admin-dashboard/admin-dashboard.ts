import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoggedInUser } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  standalone: true
})
export class AdminDashboardComponent {
  user: LoggedInUser | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getUser();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
