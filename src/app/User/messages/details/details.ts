import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../theme.service';
import { Subscription } from 'rxjs';

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  preview: string;
  fullContent: string;
  date: string;
  time: string;
  avatarUrl: string;
  relativeTime: string;

  isRead: boolean;
  isArchived: boolean;
}

@Component({
  selector: 'app-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './details.html',
  styleUrl: './details.css',
})



export class Details implements OnInit, OnDestroy {
  @Input() message!: Message;
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

  // Reply draft
  replyContent = '';

  // Navigation methods
  goBackToList(): void {
    this.backToList.emit();
  }

  toggleMessageStatus(): void {
    // Toggle read/unread
    this.message.isRead = !this.message.isRead;
  }

  archiveMessage(): void {
    this.message.isArchived = true;
  }

  sendReply(): void {
    if (this.replyContent.trim()) {
      console.log('Reply sent:', this.replyContent);
      this.replyContent = '';

      // Mark as read when replying
      if (!this.message.isRead) {
        this.message.isRead = true;
      }
    }
  }

  // Optional: helper to get display label
  getStatusInfo(): { label: string, color: string } {
    if (this.message.isArchived) {
      return { label: 'Archived', color: 'bg-gray-400' };
    } else if (this.message.isRead) {
      return { label: 'Read', color: 'bg-green-400' };
    } else {
      return { label: 'Unread', color: 'bg-cyan-400' };
    }
  }
}