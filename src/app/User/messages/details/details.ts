import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  status: 'unread' | 'read' | 'archived';
  relativeTime: string;
}

@Component({
  selector: 'app-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './details.html',
  styleUrl: './details.css',
})



export class Details {
  @Input() message!: Message;
  @Output() backToList = new EventEmitter<void>();

  // Available statuses
  statuses = [
    { value: 'unread', label: 'Unread', color: 'bg-cyan-400' },
    { value: 'read', label: 'Read', color: 'bg-green-400' },
    { value: 'archived', label: 'Archived', color: 'bg-gray-400' }
  ];

  showDetails = false;


  // Reply draft
  replyContent = '';

  // Navigation methods
  goBackToList(): void {
    this.backToList.emit();
  }

  toggleMessageStatus(): void {
    if (this.message.status === 'unread') {
      this.message.status = 'read';
    } else if (this.message.status === 'read') {
      this.message.status = 'unread';
    }
  }

  archiveMessage(): void {
    this.message.status = 'archived';
  }

  sendReply(): void {
    if (this.replyContent.trim()) {
      console.log('Reply sent:', this.replyContent);
      // In a real app, this would send the reply
      this.replyContent = '';
      // Mark as read when replying
      if (this.message.status === 'unread') {
        this.message.status = 'read';
      }
    }
  }

  // Get status display info
  getStatusInfo(status: string): { label: string, color: string } {
    const statusObj = this.statuses.find(s => s.value === status);
    return statusObj || { label: 'Unknown', color: 'bg-gray-400' };
  }
}
