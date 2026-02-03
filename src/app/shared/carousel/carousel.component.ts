import { AfterViewInit, ChangeDetectionStrategy, Component, ContentChild, ElementRef, HostListener, Input, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent<T = any> implements AfterViewInit, OnDestroy {
  @Input() items: T[] = [];

  @Input() autoplay: boolean = true;
  @Input() autoplayDelayMs: number = 3500;

  @Input() showArrows: boolean = true;
  @Input() showDots: boolean = true;

  @Input() gapPx: number = 24;

  @Input() perViewDesktop: number = 4;
  @Input() perViewTablet: number = 2;
  @Input() perViewMobile: number = 1;

  @Input() pauseOnHover: boolean = true;

  @ContentChild(TemplateRef) itemTemplate!: TemplateRef<{ $implicit: T }>;

  @ViewChild('viewport', { static: true }) viewportRef!: ElementRef<HTMLElement>;
  @ViewChild('track', { static: true }) trackRef!: ElementRef<HTMLElement>;

  perView: number = 1;
  clonesCount: number = 1;

  renderedItems: T[] = [];

  currentIndex: number = 0;
  isAnimating: boolean = false;
  transitionEnabled: boolean = true;

  translateXPx: number = 0;

  private autoplayId: any;

  ngAfterViewInit(): void {
    this.recalculate();
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  @HostListener('window:resize')
  onResize() {
    this.recalculate();
  }

  onMouseEnter() {
    if (!this.pauseOnHover) return;
    this.stopAutoplay();
  }

  onMouseLeave() {
    if (!this.pauseOnHover) return;
    this.startAutoplay();
  }

  recalculate() {
    this.perView = this.getPerView();
    this.clonesCount = Math.max(1, Math.min(this.perView, this.items.length || 1));

    this.renderedItems = this.buildRenderedItems();
    this.currentIndex = this.clonesCount;

    this.disableTransitionTemporarily(() => {
      this.updateTranslate();
    });
  }

  private getPerView(): number {
    const w = window.innerWidth;
    if (w <= 640) return Math.max(1, this.perViewMobile);
    if (w <= 1024) return Math.max(1, this.perViewTablet);
    return Math.max(1, this.perViewDesktop);
  }

  private buildRenderedItems(): T[] {
    if (!this.items.length) return [];

    const head = this.items.slice(0, this.clonesCount);
    const tail = this.items.slice(-this.clonesCount);
    return [...tail, ...this.items, ...head];
  }

  get dots(): number[] {
    return Array.from({ length: this.items.length }, (_, i) => i);
  }

  get activeDot(): number {
    if (!this.items.length) return 0;
    const raw = this.currentIndex - this.clonesCount;
    const mod = ((raw % this.items.length) + this.items.length) % this.items.length;
    return mod;
  }

  goToDot(dotIndex: number) {
    if (!this.items.length) return;
    this.stopAutoplay();

    const target = this.clonesCount + dotIndex;
    this.currentIndex = target;
    this.transitionEnabled = true;
    this.updateTranslate();

    this.startAutoplay();
  }

  prev() {
    if (!this.canMove()) return;
    this.stopAutoplay();

    this.transitionEnabled = true;
    this.currentIndex -= 1;
    this.updateTranslate();

    this.startAutoplay();
  }

  next() {
    if (!this.canMove()) return;
    this.transitionEnabled = true;
    this.currentIndex += 1;
    this.updateTranslate();
  }

  private canMove(): boolean {
    return this.items.length > 0;
  }

  private updateTranslate() {
    const viewportEl = this.viewportRef.nativeElement;
    const trackEl = this.trackRef.nativeElement;

    const gap = this.gapPx;
    const viewportWidth = viewportEl.getBoundingClientRect().width;
    const perView = Math.max(1, this.perView);

    const itemWidth = (viewportWidth - gap * (perView - 1)) / perView;
    const step = itemWidth + gap;

    this.translateXPx = this.currentIndex * step;

    // force style recalculation
    trackEl.style.setProperty('--gap', `${gap}px`);
    trackEl.style.setProperty('--per-view', `${perView}`);
    trackEl.style.setProperty('--translate-x', `${this.translateXPx}px`);
    trackEl.classList.toggle('is-transitioning', this.transitionEnabled);
  }

  onTrackTransitionEnd(evt: TransitionEvent) {
    if (evt.propertyName !== 'transform') return;
    if (!this.items.length) return;

    const maxRealIndex = this.clonesCount + this.items.length - 1;

    // went into head clones
    if (this.currentIndex > maxRealIndex) {
      this.currentIndex = this.clonesCount;
      this.disableTransitionTemporarily(() => this.updateTranslate());
      return;
    }

    // went into tail clones
    if (this.currentIndex < this.clonesCount) {
      this.currentIndex = this.clonesCount + this.items.length - 1;
      this.disableTransitionTemporarily(() => this.updateTranslate());
    }
  }

  private disableTransitionTemporarily(fn: () => void) {
    this.transitionEnabled = false;
    fn();
    // next frame: re-enable
    requestAnimationFrame(() => {
      this.transitionEnabled = true;
      this.trackRef.nativeElement.classList.add('is-transitioning');
    });
  }

  private startAutoplay() {
    if (!this.autoplay) return;
    if (this.items.length <= this.perView) return;
    if (this.autoplayId) return;

    this.autoplayId = setInterval(() => {
      if (!this.pauseOnHover) {
        this.next();
        return;
      }
      this.next();
    }, this.autoplayDelayMs);
  }

  private stopAutoplay() {
    if (!this.autoplayId) return;
    clearInterval(this.autoplayId);
    this.autoplayId = undefined;
  }
}
