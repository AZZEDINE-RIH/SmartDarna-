import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Details } from './details/details';
import { ThemeService } from '../../theme.service';
import { ActivatedRoute } from '@angular/router';
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
  selector: 'app-messages',
  imports: [CommonModule, Details],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages implements OnInit, OnDestroy {

  activeTab: 'all' | 'unread' | 'archived' = 'all';

  showDetails = false;
  selectedMessage: Message | null = null;
  isDarkMode: boolean = false;
  private themeSubscription?: Subscription;

  constructor(private themeService: ThemeService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });

    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'unread') {
        this.activeTab = 'unread';
      }
    });
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
  }

messages: Message[] = [
  {
    id: 1,
    name: 'Ahmed El Amrani',
    email: 'ahmed@email.com',
    subject: 'Problem with my order',
    preview: 'Hello, I received my order but one item is missing...',
    fullContent:
      'Hello,\n\nI received my order yesterday but unfortunately one item was missing from the package. Please check and let me know how we can fix this issue.\n\nThank you.',
    date: '2026-01-25',
    time: '10:32 AM',
    avatarUrl: 'https://i.pravatar.cc/80?img=12',
    relativeTime: '2 days ago',
    isRead: false,
    isArchived: false
  },
  {
    id: 2,
    name: 'Sara Benali',
    email: 'sara.b@email.com',
    subject: 'Payment confirmation',
    preview: 'I made the payment but did not receive confirmation...',
    fullContent:
      'Hi,\n\nI completed the payment successfully, but I still haven’t received any confirmation email. Could you please verify?\n\nBest regards.',
    date: '2026-01-24',
    time: '3:15 PM',
    avatarUrl: 'https://i.pravatar.cc/80?img=32',
    relativeTime: '3 days ago',
    isRead: true,
    isArchived: false
  },
  {
    id: 3,
    name: 'Youssef Rahmani',
    email: 'y.rahmani@email.com',
    subject: 'Account access issue',
    preview: 'I cannot log into my account anymore...',
    fullContent:
      'Hello Support,\n\nSince yesterday I am unable to log into my account. It says invalid credentials even after resetting my password.\n\nPlease help.',
    date: '2026-01-22',
    time: '6:40 PM',
    avatarUrl: 'https://i.pravatar.cc/80?img=68',
    relativeTime: '5 days ago',
    isRead: true,
    isArchived: false
  },
  {
    id: 4,
    name: 'Imane Zerktouni',
    email: 'imane@email.com',
    subject: 'Request for invoice',
    preview: 'Could you please send me the invoice for my purchase?',
    fullContent:
      'Good morning,\n\nI need the official invoice for my last purchase for accounting purposes.\n\nThank you in advance.',
    date: '2026-01-20',
    time: '9:10 AM',
    avatarUrl: 'https://i.pravatar.cc/80?img=25',
    relativeTime: '1 week ago',
    isRead: true,
    isArchived: true
  },
  {
    id: 5,
    name: 'Omar Lahlou',
    email: 'omar@email.com',
    subject: 'Website bug report',
    preview: 'I found a bug when submitting the contact form...',
    fullContent:
      'Hello team,\n\nWhen submitting the contact form, the page freezes and does not show any success message.\n\nBrowser: Chrome\nDevice: Desktop.',
    date: '2026-01-19',
    time: '11:55 AM',
    avatarUrl: 'https://i.pravatar.cc/80?img=60',
    relativeTime: '1 week ago',
    isRead: false,
    isArchived: false
  }
];


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
