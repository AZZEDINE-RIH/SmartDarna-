import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService, SellerRequest } from '../../../../services/admin-dashboard.service';

@Component({
  selector: 'app-seller-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h2>Seller Requests</h2>
        <span class="badge">{{ requests.length }} pending</span>
      </div>
      
      <div class="requests-list" *ngIf="!isLoading && requests.length > 0">
        <div *ngFor="let req of requests" class="request-item">
          <div class="request-info">
            <h4>{{ req.shopName }}</h4>
            <p>{{ req.sellerName }}</p>
          </div>
          <div class="request-actions">
            <button class="btn-approve" (click)="approve(req.id)">Approve</button>
            <button class="btn-reject" (click)="reject(req.id)">Reject</button>
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading">Loading...</div>
      <div *ngIf="!isLoading && requests.length === 0" class="empty-state">
        <p>No pending requests</p>
      </div>
    </div>
  `,
  styles: [`
    .card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .request-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid #f0f0f0; }
    .request-item:last-child { border-bottom: none; }
    .request-info h4 { margin: 0; font-size: 1rem; }
    .request-info p { margin: 0.25rem 0 0; color: #666; font-size: 0.875rem; }
    .request-actions { display: flex; gap: 0.5rem; }
    button { border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
    .btn-approve { background: #dcfce7; color: #166534; }
    .btn-reject { background: #fee2e2; color: #991b1b; }
    .badge { background: #fff7ed; color: #c2410c; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
  `]
})
export class SellerRequestsComponent implements OnInit {
  requests: SellerRequest[] = [];
  isLoading = true;

  constructor(private adminService: AdminDashboardService) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this.adminService.getSellerRequests().subscribe(data => {
      this.requests = data;
      this.isLoading = false;
    });
  }

  approve(id: string) {
    this.adminService.updateSellerStatus(id, 'approved').subscribe(() => this.loadRequests());
  }

  reject(id: string) {
    this.adminService.updateSellerStatus(id, 'rejected').subscribe(() => this.loadRequests());
  }
}
