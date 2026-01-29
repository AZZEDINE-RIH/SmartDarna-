import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Details } from './details/details';

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
  selector: 'app-messages',
  imports: [CommonModule, Details],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages {

  activeTab: 'all' | 'unread' | 'archived' = 'all';

  showDetails = false;
  selectedMessage: Message | null = null;

  messages: Message[] = [ /* YOUR DATA — unchanged */ ];

  // ✅ MAIN FILTER
  get filteredMessages(): Message[] {
    switch (this.activeTab) {
      case 'unread':
        return this.messages.filter(m => !m.isRead && !m.isArchived);

      case 'archived':
        return this.messages.filter(m => m.isArchived);

      default:
        return this.messages.filter(m => !m.isArchived);
    }
  }

  setActiveTab(tab: 'all' | 'unread' | 'archived'): void {
    this.activeTab = tab;
  }

  onMessageClick(message: Message): void {
    message.isRead = true;
    this.selectedMessage = message;
    this.showDetails = true;
  }

  archiveMessage(message: Message): void {
    message.isArchived = true;
  }

  onBackToList(): void {
    this.showDetails = false;
    this.selectedMessage = null;
  }

  getUnreadCount(): number {
    return this.messages.filter(m => !m.isRead && !m.isArchived).length;
  }

  getTotalCount(): number {
    return this.filteredMessages.length;
  }
}
