import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ThemeService } from '../../../theme.service';
import { Subscription } from 'rxjs';

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: string[];
  totalAmount: number;
  status: 'pending' | 'shipped' | 'delivered';
  date: string;
  time: string;
  avatarUrl: string;
  relativeTime: string;
  isRead: boolean;
  isArchived: boolean;
}

@Component({
  selector: 'app-info',
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './info.html',
  styleUrl: './info.css',
})
export class Info implements OnInit, OnDestroy {
  @Input() order: Order | null = null;
  @Output() backToList = new EventEmitter<void>();
  isDarkMode: boolean = false;
  private themeSubscription?: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
  }

  onBack(): void {
    this.backToList.emit();
  }
}
