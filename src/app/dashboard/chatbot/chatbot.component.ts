import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ChatRole = 'user' | 'bot';

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: Date;
}

type ChatTopic =
  | 'general'
  | 'products'
  | 'buying'
  | 'orders'
  | 'payments'
  | 'delivery'
  | 'returns'
  | 'seller'
  | 'account'
  | 'support';

interface BotResponse {
  text: string;
  topic: ChatTopic;
  suggestions?: string[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-widget" [class.open]="isOpen()">
      <button
        *ngIf="!isOpen()"
        class="launcher"
        type="button"
        (click)="open()"
        aria-label="Open SmartDarna assistant"
      >
        <span class="launcher-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 12c0 4.418-4.03 8-9 8a10.7 10.7 0 0 1-3.5-.57L3 21l1.64-4.1A7.3 7.3 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="M7.5 12h.01M12 12h.01M16.5 12h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </span>
      </button>

      <section *ngIf="isOpen()" class="chatbot" aria-label="SmartDarna assistant">
        <header class="chatbot-header">
          <div class="chatbot-title">
            <h2>SmartDarna Assistant</h2>
            <p>Support for products, orders, and seller onboarding.</p>
          </div>

          <div class="header-actions">
            <button class="btn btn-secondary" type="button" (click)="clear()" [disabled]="messages().length === 0">
              Clear
            </button>
            <button class="btn btn-secondary" type="button" (click)="close()" aria-label="Close assistant">
              ✕
            </button>
          </div>
        </header>

        <div class="chatbot-body" role="log" aria-live="polite">
          <div *ngIf="messages().length === 0" class="empty">
            <div class="empty-title">No messages yet</div>
            <div class="empty-subtitle">Hi! I’m SmartDarna’s virtual assistant. How can I help?</div>

            <div class="suggestions" *ngIf="suggestions().length">
              <button
                *ngFor="let s of suggestions(); trackBy: trackBySuggestion"
                type="button"
                class="chip"
                (click)="useSuggestion(s)"
              >
                {{ s }}
              </button>
            </div>
          </div>

          <div *ngFor="let m of messages(); trackBy: trackById" class="msg" [class.user]="m.role === 'user'" [class.bot]="m.role === 'bot'">
            <div class="bubble">
              <div class="text">{{ m.text }}</div>
              <div class="meta">{{ m.role === 'user' ? 'You' : 'Bot' }} • {{ formatTime(m.createdAt) }}</div>
            </div>
          </div>

          <div *ngIf="isTyping()" class="msg bot">
            <div class="bubble typing">
              <div class="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="suggestions" *ngIf="messages().length > 0 && suggestions().length">
          <button
            *ngFor="let s of suggestions(); trackBy: trackBySuggestion"
            type="button"
            class="chip"
            (click)="useSuggestion(s)"
          >
            {{ s }}
          </button>
        </div>

        <form class="chatbot-input" (ngSubmit)="send()">
          <input
            name="message"
            [(ngModel)]="draft"
            type="text"
            class="input"
            placeholder="Type your message..."
            autocomplete="off"
          />

          <button class="btn btn-primary" type="submit" [disabled]="!draft.trim()">Send</button>
        </form>
      </section>
    </div>
  `,
  styles: [`
    .chatbot-widget {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 1000;
    }

    .launcher {
      width: 56px;
      height: 56px;
      border-radius: 999px;
      border: 1px solid rgba(15, 23, 42, 0.14);
      background: linear-gradient(135deg, #0f766e 0%, #0f172a 100%);
      color: #ffffff;
      cursor: pointer;
      box-shadow: 0 18px 40px rgba(2, 6, 23, 0.22);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.12s ease, box-shadow 0.2s ease;
    }

    .launcher:hover {
      transform: translateY(-1px);
      box-shadow: 0 22px 55px rgba(2, 6, 23, 0.28);
    }

    .launcher:active {
      transform: translateY(0px);
    }

    .launcher-icon {
      display: inline-flex;
    }

    .chatbot {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(2, 6, 23, 0.06);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      width: 380px;
      max-width: calc(100vw - 36px);
    }

    .chatbot-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 18px;
      background: linear-gradient(135deg, #0f766e 0%, #0f172a 100%);
      color: #fff;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .chatbot-title h2 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: -0.2px;
    }

    .chatbot-title p {
      margin: 4px 0 0 0;
      font-size: 0.85rem;
      opacity: 0.85;
    }

    .chatbot-body {
      padding: 16px;
      height: 320px;
      overflow: auto;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .empty {
      margin: auto;
      text-align: center;
      color: #64748b;
    }

    .empty-title {
      font-weight: 700;
      color: #334155;
    }

    .empty-subtitle {
      margin-top: 6px;
      font-size: 0.9rem;
    }

    .msg {
      display: flex;
    }

    .msg.user {
      justify-content: flex-end;
    }

    .msg.bot {
      justify-content: flex-start;
    }

    .bubble {
      max-width: min(680px, 92%);
      border-radius: 14px;
      padding: 10px 12px;
      border: 1px solid rgba(15, 23, 42, 0.08);
      background: #fff;
    }

    .msg.user .bubble {
      background: #0f766e;
      color: #fff;
      border-color: rgba(255, 255, 255, 0.18);
    }

    .text {
      white-space: pre-wrap;
      line-height: 1.35;
      font-size: 0.95rem;
    }

    .meta {
      margin-top: 8px;
      font-size: 0.72rem;
      opacity: 0.75;
    }

    .chatbot-input {
      display: flex;
      gap: 10px;
      padding: 14px;
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
    }

    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 10px 14px;
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
    }

    .chip {
      border: 1px solid rgba(15, 23, 42, 0.12);
      background: #f8fafc;
      color: #0f172a;
      border-radius: 999px;
      padding: 8px 12px;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.85rem;
      transition: background 0.2s ease, border-color 0.2s ease;
    }

    .chip:hover {
      background: #eef2ff;
      border-color: rgba(79, 70, 229, 0.25);
    }

    .typing {
      width: 110px;
    }

    .typing-dots {
      display: flex;
      gap: 6px;
      align-items: center;
      justify-content: flex-start;
      padding: 2px 0;
    }

    .typing-dots span {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.35);
      animation: dot 1.1s infinite ease-in-out;
    }

    .typing-dots span:nth-child(2) {
      animation-delay: 0.15s;
    }

    .typing-dots span:nth-child(3) {
      animation-delay: 0.3s;
    }

    @keyframes dot {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
      40% { transform: translateY(-4px); opacity: 0.95; }
    }

    .input {
      flex: 1;
      padding: 12px 12px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
      outline: none;
      font-size: 0.95rem;
    }

    .input:focus {
      border-color: #14b8a6;
      box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.14);
    }

    .btn {
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid transparent;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.9rem;
      transition: transform 0.08s ease, box-shadow 0.2s ease, background 0.2s ease;
      white-space: nowrap;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn:active:not(:disabled) {
      transform: translateY(1px);
    }

    .btn-primary {
      background: #0f766e;
      color: #fff;
      box-shadow: 0 10px 20px rgba(15, 118, 110, 0.18);
    }

    .btn-primary:hover:not(:disabled) {
      background: #115e59;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.18);
      color: #fff;
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.16);
    }

    @media (max-width: 768px) {
      .chatbot-widget {
        right: 12px;
        bottom: 12px;
      }

      .chatbot {
        width: min(92vw, 380px);
      }

      .chatbot-body {
        height: 300px;
      }

      .chatbot-input {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }

      .header-actions .btn {
        width: auto;
      }

      .header-actions {
        gap: 8px;
      }
    }
  `]
})
export class ChatbotComponent implements OnInit {
  draft = '';

  readonly messages = signal<ChatMessage[]>([]);
  readonly isTyping = signal(false);
  readonly suggestions = signal<string[]>(this.getStarterSuggestions());
  readonly topic = signal<ChatTopic>('general');
  readonly isOpen = signal(false);

  private readonly storageKey = 'smartdarna_chatbot_messages_v1';

  trackById(_: number, m: ChatMessage): string {
    return m.id;
  }

  trackBySuggestion(_: number, s: string): string {
    return s;
  }

  ngOnInit(): void {
    this.restoreFromStorage();
  }

  constructor() {
    effect(() => {
      const msgs = this.messages();
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
      try {
        const payload = msgs.map((m) => ({
          ...m,
          createdAt: m.createdAt.toISOString()
        }));
        localStorage.setItem(this.storageKey, JSON.stringify(payload));
      } catch {
        return;
      }
    });
  }

  send(): void {
    const text = this.draft.trim();
    if (!text) return;

    this.append('user', text);
    this.draft = '';

    const response = this.generateReply(text);
    this.topic.set(response.topic);
    this.suggestions.set(response.suggestions ?? this.getSuggestionsForTopic(response.topic));

    this.isTyping.set(true);
    const delayMs = 450 + Math.floor(Math.random() * 500);
    setTimeout(() => {
      this.append('bot', response.text);
      this.isTyping.set(false);
    }, delayMs);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  useSuggestion(s: string): void {
    this.draft = s;
    this.send();
  }

  clear(): void {
    this.messages.set([]);
    this.isTyping.set(false);
    this.topic.set('general');
    this.suggestions.set(this.getStarterSuggestions());
  }

  formatTime(d: Date): string {
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch {
      return '';
    }
  }

  private append(role: ChatRole, text: string): void {
    const msg: ChatMessage = {
      id: this.newId(),
      role,
      text,
      createdAt: new Date()
    };

    this.messages.update((prev) => [...prev, msg]);
  }

  private generateReply(prompt: string): BotResponse {
    const p = (prompt || '').trim().toLowerCase();
    if (!p) {
      return {
        text: "Hi! I'm Alexa, your SmartDarna assistant. How can I help you today?",
        topic: 'general',
        suggestions: this.getStarterSuggestions()
      };
    }

    const mentionsOrder = p.includes('order') || p.includes('commande') || p.includes('tracking') || p.includes('track') || p.includes('livraison');
    const asksForSpecificOrder = mentionsOrder && (p.includes('#') || p.match(/\b\d{4,}\b/) !== null || p.includes('my order') || p.includes('ma commande'));

    const isShortFollowUp = p.length <= 18 || p === 'yes' || p === 'no' || p.startsWith('and ') || p.startsWith('what about');
    const currentTopic = this.topic();

    if (p.includes('hello') || p.includes('hi') || p.includes('salut') || p.includes('bonjour')) {
      return {
        text: "Hello! I'm Alexa, your SmartDarna assistant. I can help you with products, orders, tracking, or becoming a seller. What's on your mind?",
        topic: 'general',
        suggestions: this.getStarterSuggestions()
      };
    }

    if (p.includes('what is smartdarna') || (p.includes('smartdarna') && (p.includes('what is') || p.includes("c'est quoi") || p.includes('about')))) {
      return {
        text: 'SmartDarna is Morocco\'s leading marketplace for smart home solutions. We connect homeowners with the best IoT devices (cameras, locks, lighting) and verified sellers to make your home smarter and safer.',
        topic: 'general',
        suggestions: ['Browse categories', 'Create an account', 'Become a seller']
      };
    }

    if (p.includes('what do you sell') || p.includes('products') || p.includes('product') || p.includes('categories')) {
      return {
        text: 'SmartDarna focuses on smart home products like security cameras, smart lighting, smart locks, sensors, and other IoT devices.',
        topic: 'products',
        suggestions: ['Security cameras', 'Smart lighting', 'Smart locks', 'Sensors']
      };
    }

    if (p.includes('camera') || p.includes('cameras') || p.includes('security camera') || p.includes('cctv')) {
      return {
        text: 'For security cameras, compare video resolution, night vision, motion detection, storage (cloud/SD), field of view, and whether it supports Wi‑Fi or wired power. If you tell me indoor vs outdoor, I can narrow it down.',
        topic: 'products',
        suggestions: ['Indoor camera', 'Outdoor camera', 'How to choose a camera']
      };
    }

    if (p.includes('smart lock') || p.includes('lock')) {
      return {
        text: 'For smart locks, check door compatibility, unlocking methods (PIN/app/key), battery life, and whether it works with your ecosystem (Wi‑Fi/Bluetooth/Zigbee). If you tell me your door type, I can guide you.',
        topic: 'products',
        suggestions: ['Smart lock compatibility', 'Installation help', 'Delivery info']
      };
    }

    if (p.includes('smart light') || p.includes('lighting') || p.includes('bulb') || p.includes('led')) {
      return {
        text: 'For smart lighting, consider brightness (lumens), color temperature (warm/cool), RGB support, and whether it needs a hub (Zigbee) or works directly on Wi‑Fi. You’ll see compatibility details on the product page.',
        topic: 'products',
        suggestions: ['Wi‑Fi vs Zigbee', 'How to place an order', 'Payment methods']
      };
    }

    if ((p.includes('difference') || p.includes('diff') || p.includes('customer') || p.includes('seller')) && (p.includes('customer') || p.includes('seller'))) {
      return {
        text: 'A Customer account lets you browse and buy products. A Seller account is for businesses to list products and manage sales. Sellers go through a verification process to ensure quality on SmartDarna.',
        topic: 'account',
        suggestions: ['Create an account', 'Become a seller', 'Login help']
      };
    }

    if (p.includes('become a seller') || (p.includes('seller') && (p.includes('register') || p.includes('signup') || p.includes('sign up') || p.includes('apply') || p.includes('approval') || p.includes('approve')))) {
      return {
        text: 'To become a seller, click "Become a Seller" in the menu. You\'ll need to provide your shop name, business details, and contact info. Our team reviews all applications within 24-48 hours.',
        topic: 'seller',
        suggestions: ['What happens after approval?', 'Seller requirements', 'Contact support']
      };
    }

    if (p.includes('seller requirements') || p.includes('requirements') && p.includes('seller')) {
      return {
        text: 'Seller requirements depend on your region and business type. During registration, SmartDarna will ask for the information needed for review. If you’re unsure what to provide, contact support.',
        topic: 'seller',
        suggestions: ['Become a seller', 'Contact support']
      };
    }

    if (p.includes('create account') || p.includes('register') || p.includes('sign up') || p.includes('signup')) {
      return {
        text: 'To create an account, go to Register, fill in your details, then confirm your email if requested. After that you can log in normally.',
        topic: 'account',
        suggestions: ['Login help', 'Customer vs seller account', 'How to place an order']
      };
    }

    if (p.includes('login') || p.includes('log in') || p.includes('sign in') || p.includes("can't login") || p.includes('cannot login') || p.includes('invalid') || p.includes('credentials')) {
      return {
        text: "If you can’t log in, double-check your email/password, make sure your email is confirmed, and try again. If it still fails, use the help/support option in the app to contact SmartDarna support.",
        topic: 'account',
        suggestions: ['Create an account', 'Contact support']
      };
    }

    if (mentionsOrder && (p.includes('status') || p.includes('tracking') || p.includes('track') || p.includes('where is') || p.includes('delivered') || p.includes('shipped') || asksForSpecificOrder)) {
      return {
        text: "I don't have direct access to your private order details for security reasons. Please visit your Dashboard > Orders to see real-time tracking. If your order is late, I can help you contact support.",
        topic: 'orders',
        suggestions: ['Order status meaning', 'Returns & refunds', 'Contact support']
      };
    }

    if (p.includes('order status') || p.includes('order status meaning') || (mentionsOrder && p.includes('meaning')) || p.includes('status meaning')) {
      return {
        text: 'Typical order statuses include: Pending (placed), Processing (being prepared), Shipped (on the way), Delivered (received), or Cancelled/Returned. Your dashboard shows the exact status for your order.',
        topic: 'orders',
        suggestions: ['Track my order', 'Returns & refunds', 'Delivery info']
      };
    }

    if (p.includes('place an order') || (p.includes('how') && p.includes('order')) || p.includes('checkout')) {
      return {
        text: 'To place an order, choose a product, add it to your cart, go to checkout, confirm your address, and complete payment. You’ll see confirmation in your dashboard after placing it.',
        topic: 'buying',
        suggestions: ['Payment methods', 'Delivery info', 'Returns & refunds']
      };
    }

    if (p.includes('payment') || p.includes('pay') || p.includes('method') || p.includes('card') || p.includes('cash')) {
      return {
        text: 'SmartDarna supports Credit Cards (CMI, Visa, Mastercard) and Cash on Delivery (COD) for most regions in Morocco. You can see the specific options for your cart at checkout.',
        topic: 'payments',
        suggestions: ['Place an order', 'Delivery info', 'Contact support']
      };
    }

    if (p.includes('delivery') || p.includes('shipping') || p.includes('ship') || p.includes('livraison')) {
      return {
        text: 'We deliver across Morocco! Delivery usually takes 2-5 business days depending on your city. Shipping costs are calculated at checkout based on the seller\'s location and your address.',
        topic: 'delivery',
        suggestions: ['Track my order', 'Order status meaning', 'Returns & refunds']
      };
    }

    if (p.includes('return') || p.includes('refund') || p.includes('exchange') || p.includes('cancel')) {
      return {
        text: 'Returns and refunds depend on the order and seller policy. Please check your order page for available options, and contact SmartDarna support if you need help.',
        topic: 'returns',
        suggestions: ['Track my order', 'Contact support']
      };
    }

    if (p.includes('price') || p.includes('promo') || p.includes('promotion') || p.includes('discount') || p.includes('coupon')) {
      return {
        text: "You can find all active promotions on our homepage! For specific products, the price shown on the product page is final. Keep an eye out for 'Flash Sales' for the best deals.",
        topic: 'products',
        suggestions: ['Browse categories', 'How to place an order']
      };
    }

    if (p.includes('contact') || p.includes('support') || p.includes('help') || p.includes('aide') || p.includes('email') || p.includes('phone')) {
      return {
        text: "You can reach our support team at support@smartdarna.ma or via the Contact page. We're available Monday to Friday, 9 AM - 6 PM.",
        topic: 'support',
        suggestions: ['Contact support', 'Track my order', 'Returns & refunds']
      };
    }

    if (p.includes('bug') || p.includes('error') || p.includes('issue') || p.includes('crash') || p.includes('does not work')) {
      return {
        text: 'If you’re experiencing a technical issue, please try refreshing/logging out and back in. If the issue continues, contact SmartDarna support with a screenshot and a short description of what happened.',
        topic: 'support',
        suggestions: ['Contact support', 'Login help']
      };
    }

    if (p.includes('admin') || p.includes('database') || p.includes('sql') || p.includes('rls') || p.includes('internal')) {
      return {
        text: "I can’t help with internal/admin or technical backend instructions. For account or platform help, please contact SmartDarna support.",
        topic: 'support',
        suggestions: ['Contact support']
      };
    }

    if (isShortFollowUp && currentTopic !== 'general') {
      return {
        text: this.followUpByTopic(currentTopic),
        topic: currentTopic,
        suggestions: this.getSuggestionsForTopic(currentTopic)
      };
    }

    return {
      text: 'I can help with products, account access, ordering, tracking, payments, delivery basics, returns/refunds, and becoming a seller. What do you need help with?',
      topic: 'general',
      suggestions: this.getStarterSuggestions()
    };
  }

  private getStarterSuggestions(): string[] {
    return [
      'What is SmartDarna?',
      'What products do you sell?',
      'How to place an order?',
      'Track my order',
      'Payment methods',
      'Delivery info',
      'Returns & refunds',
      'Become a seller',
      'Login help'
    ];
  }

  private getSuggestionsForTopic(topic: ChatTopic): string[] {
    switch (topic) {
      case 'products':
        return ['Security cameras', 'Smart lighting', 'Smart locks', 'Sensors', 'How to place an order?'];
      case 'buying':
        return ['Payment methods', 'Delivery info', 'Returns & refunds'];
      case 'orders':
        return ['Order status meaning', 'Track my order', 'Returns & refunds', 'Contact support'];
      case 'payments':
        return ['Place an order', 'Delivery info', 'Contact support'];
      case 'delivery':
        return ['Track my order', 'Order status meaning', 'Returns & refunds'];
      case 'returns':
        return ['How to return an item?', 'Refund status', 'Contact support'];
      case 'seller':
        return ['Become a seller', 'What happens after approval?', 'Seller requirements', 'Contact support'];
      case 'account':
        return ['Create an account', 'Login help', 'Customer vs seller account', 'Contact support'];
      case 'support':
        return ['Contact support', 'Login help', 'Returns & refunds'];
      default:
        return this.getStarterSuggestions();
    }
  }

  private followUpByTopic(topic: ChatTopic): string {
    switch (topic) {
      case 'delivery':
        return 'For delivery timelines, please check the delivery info shown during checkout and your order tracking page. I can’t provide exact delivery times here.';
      case 'payments':
        return 'Payment options are shown at checkout and may vary by location and seller. If a method is missing, contact support.';
      case 'orders':
        return 'For order details, please check your dashboard. If you see a problem with status/tracking, contact support.';
      case 'returns':
        return 'Returns/refunds depend on the order and seller policy. Please check your order page for available actions or contact support.';
      case 'seller':
        return 'Seller accounts require review. After approval you can list products and manage orders from your seller dashboard.';
      case 'account':
        return 'For account help, check login/register steps in the app. If you’re blocked, contact support.';
      case 'products':
        return 'If you tell me which product type you want (camera, lock, lighting, sensors) and your use case (indoor/outdoor), I’ll guide you on what to look for.';
      default:
        return 'Can you tell me a bit more about what you need help with?';
    }
  }

  private restoreFromStorage(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Array<Omit<ChatMessage, 'createdAt'> & { createdAt: string }>;
      const restored: ChatMessage[] = (parsed || []).map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt)
      }));
      if (restored.length > 0) {
        this.messages.set(restored);
        this.suggestions.set(this.getStarterSuggestions());
      }
    } catch {
      return;
    }
  }

  private newId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return (crypto as any).randomUUID();
    }
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}
