import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, LoggedInUser } from '../../services/auth.service';

@Component({
  selector: 'app-vendeur-dashboard',
  imports: [CommonModule],
  templateUrl: './vendeur-dashboard.html',
  styleUrl: './vendeur-dashboard.css',
  standalone: true
})
export class VendeurDashboardComponent {
  user: LoggedInUser | null = null;

  constructor(private authService: AuthService) {
    this.user = this.authService.getUserSync();
  }
}
