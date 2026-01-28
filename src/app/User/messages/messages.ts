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
  status: 'unread' | 'read' | 'archived';
  relativeTime: string;
}

@Component({
  selector: 'app-messages',
  imports: [CommonModule, Details],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages {
  showDetails = false;
  selectedMessage: Message | null = null;

  messages: Message[] = [
    {
      id: 1,
      name: 'Sarah Miller',
      email: 'sarah.m@email.com',
      subject: 'Smart Hub Installation Inquiry',
      preview: "Hello, I'm interested in the Smart Hub. I'd like to know if installation is inc...",
      fullContent: "Hello,\n\nI'm interested in the Smart Hub. I'd like to know if installation is included in the purchase price. I recently moved into a new apartment and I'm looking to set up a smart home system. The Smart Hub seems like it would fit my needs perfectly.\n\nCould you also let me know:\n1. What's the installation timeline?\n2. Do you provide professional installation or is it DIY?\n3. Are there any additional costs for installation?\n4. What's the warranty coverage for installation?\n\nI'd appreciate it if you could provide this information. I'm looking to make a purchase decision by the end of the week.\n\nThank you,\nSarah Miller",
      date: 'Nov 12, 2023',
      time: '10:30 AM',
      avatarUrl: 'https://i.pravatar.cc/80?img=1',
      status: 'unread',
      relativeTime: '2 hours ago'
    },
    {
      id: 2,
      name: 'James Wilson',
      email: 'james@outlook.com',
      subject: 'Warranty Question - Order #8827',
      preview: 'Regarding my recent purchase, order #8827, I have a warranty cover remote water da...',
      fullContent: 'Hello,\n\nI recently purchased order #8827 and I have a question about the warranty coverage. The product description mentions remote water damage protection, but I\'m not sure if this covers accidental spills or just flood damage.\n\nCould you please clarify what\'s covered under the warranty? I had an incident where some water was spilled on the device and I want to make sure it\'s covered.\n\nThank you for your help.\n\nBest regards,\nJames Wilson',
      date: 'Nov 11, 2023',
      time: '4:32 PM',
      avatarUrl: 'https://i.pravatar.cc/80?img=12',
      status: 'read',
      relativeTime: 'Yesterday'
    },
    {
      id: 3,
      name: 'Michael Chen',
      email: 'mchen_bt@me.com',
      subject: 'Return Request',
      preview: 'I received the X-89 power kit fit my current door frame. Can I start a return process?',
      fullContent: 'Hi there,\n\nI received the X-89 power kit today, but unfortunately it doesn\'t fit my current door frame. The dimensions don\'t match what I was expecting based on the product specifications.\n\nCan I start a return process? I still have the original packaging and all accessories. I\'d like to exchange it for a different model that would be compatible with my setup.\n\nPlease let me know the next steps.\n\nThank you,\nMichael Chen',
      date: 'Oct 22, 2023',
      time: '2:15 PM',
      avatarUrl: 'https://i.pravatar.cc/80?img=33',
      status: 'unread',
      relativeTime: 'Oct 22, 2023'
    },
    {
      id: 4,
      name: 'Emily Zhang',
      email: 'ezhang.smith@outlook.com',
      subject: 'Compatibility with Apple HomeKit',
      preview: 'I\'m looking to see if I order are products compatible with HomeKit...',
      fullContent: 'Hello,\n\nI\'m looking to purchase some smart home devices and I wanted to confirm if all your products are compatible with Apple HomeKit. I have an existing HomeKit setup and I want to make sure everything will integrate seamlessly.\n\nSpecifically, I\'m interested in your smart locks, thermostats, and cameras. Do they all support HomeKit Secure Video and HomeKit-enabled accessories?\n\nThank you for your assistance.\n\nBest regards,\nEmily Zhang',
      date: 'Oct 21, 2023',
      time: '9:45 AM',
      avatarUrl: 'https://i.pravatar.cc/80?img=5',
      status: 'read',
      relativeTime: 'Oct 21, 2023'
    }
  ];

  onMessageClick(message: Message): void {
    this.selectedMessage = message;
    this.showDetails = true;
  }

  onBackToList(): void {
    this.showDetails = false;
    this.selectedMessage = null;
  }

  getUnreadCount(): number {
    return this.messages.filter(message => message.status === 'unread').length;
  }
}
