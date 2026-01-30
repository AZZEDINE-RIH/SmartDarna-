import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SellerService, Seller } from '../../../../services/seller.service';

@Component({
  selector: 'app-seller-requests',
  standalone: true,
  imports: [CommonModule],
  providers: [SellerService],
  template: `
    <div class="seller-requests-container">
      <div class="header">
        <h2>Seller Requests</h2>
        <a href="#" class="view-all">View All</a>
      </div>
      
      <div *ngIf="isLoading" class="loading-state">
        <p>Loading seller requests...</p>
      </div>

      <div *ngIf="!isLoading && sellers.length === 0" class="no-data">
        <p>Data coming soon</p>
      </div>

      <div *ngIf="!isLoading && sellers.length > 0" class="sellers-list">
        <div *ngFor="let seller of sellers" class="seller-item">
          <div class="seller-avatar">{{ getInitials(seller.full_name) }}</div>
          <div class="seller-info">
            <div class="seller-name">{{ seller.full_name }}</div>
            <div class="seller-shop">{{ seller.shop_name }}</div>
          </div>
          <div class="seller-actions">
            <button 
              class="btn-reject" 
              (click)="rejectSeller(seller.id)"
              [disabled]="isProcessing"
              title="Reject">
              ✕
            </button>
            <button 
              class="btn-approve" 
              (click)="approveSeller(seller.id)"
              [disabled]="isProcessing"
              title="Approve">
              ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .seller-requests-container {
      background: white;
      border-radius: 8px;
      padding: 25px;
      border: 1px solid #e8e8e8;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .view-all {
      color: #00d4ff;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .view-all:hover {
      color: #0099cc;
      text-decoration: underline;
    }

    .loading-state,
    .no-data {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .sellers-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .seller-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
      transition: background 0.3s ease;
    }

    .seller-item:hover {
      background: #f0f0f0;
    }

    .seller-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      flex-shrink: 0;
    }

    .seller-info {
      flex: 1;
    }

    .seller-name {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 3px;
    }

    .seller-shop {
      font-size: 12px;
      color: #999;
    }

    .seller-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .btn-reject,
    .btn-approve {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      font-size: 16px;
      font-weight: 700;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-reject {
      background: rgba(255, 107, 107, 0.1);
      color: #ff6b6b;
    }

    .btn-reject:hover:not(:disabled) {
      background: #ff6b6b;
      color: white;
      transform: scale(1.1);
    }

    .btn-approve {
      background: rgba(45, 206, 137, 0.1);
      color: #2dce89;
    }

    .btn-approve:hover:not(:disabled) {
      background: #2dce89;
      color: white;
      transform: scale(1.1);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .seller-requests-container {
        padding: 15px;
      }

      .seller-item {
        padding: 12px;
        gap: 10px;
      }

      .seller-avatar {
        width: 40px;
        height: 40px;
      }

      .seller-name {
        font-size: 13px;
      }

      .seller-shop {
        font-size: 11px;
      }
    }
  `]
})
export class SellerRequestsComponent implements OnInit {
  sellers: Seller[] = [];
  isLoading = true;
  isProcessing = false;

  constructor(private sellerService: SellerService) {}

  ngOnInit() {
    this.loadPendingSellers();
  }

  loadPendingSellers() {
    this.isLoading = true;
    this.sellerService.getPendingSellers().subscribe({
      next: (data) => {
        this.sellers = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading sellers:', err);
        this.isLoading = false;
      }
    });
  }

  approveSeller(sellerId: string) {
    this.isProcessing = true;
    console.log('Approve seller:', sellerId);
    // TODO: Implement approve seller action
    setTimeout(() => {
      this.isProcessing = false;
      this.loadPendingSellers();
    }, 500);
  }

  rejectSeller(sellerId: string) {
    this.isProcessing = true;
    console.log('Reject seller:', sellerId);
    // TODO: Implement reject seller action
    setTimeout(() => {
      this.isProcessing = false;
      this.loadPendingSellers();
    }, 500);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
