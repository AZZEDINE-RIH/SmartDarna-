import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, LoggedInUser } from '../../services/auth.service';
import { ChatbotComponent } from '../chatbot/chatbot.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ChatbotComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
  standalone: true
})
export class HomeComponent implements OnInit {
  user: LoggedInUser | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      if (!user) {
        this.user = null;
        return;
      }
      void this.authService.getUser().then(profile => {
        this.user = profile;
      });
    });
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
