import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopbarComponent } from './layout/topbar/topbar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    TopbarComponent
  ],
  template: `
    <div class="admin-layout">
      <app-sidebar></app-sidebar>
      <div class="main-wrapper">
        <app-topbar [user]="user"></app-topbar>
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background-color: #f8fafc;
    }

    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }
  `]
})
export class AdminDashboardComponent {
  user: any | null = null;

  constructor(private authService: AuthService) {
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
}
