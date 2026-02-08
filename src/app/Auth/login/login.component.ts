import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  focusedField: 'email' | 'password' | null = null;

  @ViewChild('card', { read: ElementRef })
  private cardRef?: ElementRef<HTMLElement>;

  @ViewChild('speech', { read: ElementRef })
  private speechRef?: ElementRef<HTMLElement>;

  @ViewChild('alexaFloat', { read: ElementRef })
  private alexaFloatRef?: ElementRef<SVGGElement>;

  @ViewChild('alexaArm', { read: ElementRef })
  private alexaArmRef?: ElementRef<SVGGElement>;

  @ViewChild('alexaEyes', { read: ElementRef })
  private alexaEyesRef?: ElementRef<SVGGElement>;

  private gsap: any | null = null;
  private introTl: any | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  async ngAfterViewInit(): Promise<void> {
    if (typeof window === 'undefined') return;

    const gsap = await this.getGsap();
    if (!gsap) return;

    const card = this.cardRef?.nativeElement;
    const speech = this.speechRef?.nativeElement;
    const floatGroup = this.alexaFloatRef?.nativeElement;
    const arm = this.alexaArmRef?.nativeElement;
    const eyes = this.alexaEyesRef?.nativeElement;

    if (arm) {
      gsap.set(arm, {
        transformBox: 'fill-box',
        transformOrigin: '50% 20%'
      });
    }

    if (eyes) {
      gsap.set(eyes, {
        transformBox: 'fill-box',
        transformOrigin: '50% 50%'
      });
    }

    if (card) {
      gsap.set(card, { opacity: 0, y: 20, scale: 0.98 });
    }
    if (speech) {
      gsap.set(speech, { opacity: 0, y: 10, scale: 0.98, transformOrigin: '50% 100%' });
    }

    this.introTl = gsap.timeline();

    if (card) {
      this.introTl.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power3.out' }, 0);
    }

    if (speech) {
      this.introTl.to(speech, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.4)' }, 0.15);
    }

    if (floatGroup) {
      gsap.to(floatGroup, { y: -5, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }

    this.setPose('idle');
  }

  ngOnDestroy(): void {
    const gsap = this.gsap;
    this.introTl?.kill();
    const floatGroup = this.alexaFloatRef?.nativeElement;
    const arm = this.alexaArmRef?.nativeElement;
    const eyes = this.alexaEyesRef?.nativeElement;
    const speech = this.speechRef?.nativeElement;
    if (gsap) {
      gsap.killTweensOf([floatGroup, arm, eyes, speech].filter(Boolean));
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Basic validation
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      this.isLoading = false;
      return;
    }

    console.log('Attempting login with email:', this.email);

    try {
      await this.authService.signIn(this.email, this.password);
      // Navigation is handled by auth state change in AuthService
    } catch (error: any) {
      console.error('Login error:', error);

      this.ngZone.run(() => {
        // More specific error messages
        if (error.message?.includes('Invalid login credentials')) {
          this.errorMessage = 'Invalid email or password. Please check your credentials or register first.';
        } else if (error.message?.includes('Email not confirmed')) {
          this.errorMessage = 'Please confirm your email address before logging in.';
        } else {
          this.errorMessage = error.message || 'Login failed. Please try again.';
        }
      });
    } finally {
      this.ngZone.run(() => {
        this.isLoading = false;
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  onFieldFocus(field: 'email' | 'password'): void {
    this.focusedField = field;
    this.setPose(field);
  }

  onFieldBlur(field: 'email' | 'password'): void {
    if (this.focusedField === field) {
      this.focusedField = null;
    }
    this.setPose('idle');
  }

  private setPose(pose: 'idle' | 'email' | 'password'): void {
    if (typeof window === 'undefined') return;

    const gsap = this.gsap;
    if (!gsap) return;

    const arm = this.alexaArmRef?.nativeElement;
    const eyes = this.alexaEyesRef?.nativeElement;
    if (!arm || !eyes) return;

    switch (pose) {
      case 'email':
        gsap.to(arm, { x: -6, y: -8, rotation: -10, duration: 0.45, ease: 'power3.out' });
        gsap.to(eyes, { x: -1.5, y: -0.5, duration: 0.35, ease: 'power2.out' });
        break;
      case 'password':
        gsap.to(arm, { x: 6, y: 6, rotation: 12, duration: 0.45, ease: 'power3.out' });
        gsap.to(eyes, { x: 1.5, y: 1.2, duration: 0.35, ease: 'power2.out' });
        break;
      default:
        gsap.to(arm, { x: 0, y: 0, rotation: 0, duration: 0.55, ease: 'power3.out' });
        gsap.to(eyes, { x: 0, y: 0, duration: 0.45, ease: 'power2.out' });
    }
  }

  private async getGsap(): Promise<any | null> {
    if (this.gsap) return this.gsap;
    try {
      const mod: any = await import('gsap');
      this.gsap = mod?.gsap || mod?.default || mod;
      return this.gsap;
    } catch {
      return null;
    }
  }

  async signInWithGithub(): Promise<void> {
    try {
      await this.authService.signInWithGithub();
    } catch (error: any) {
      this.errorMessage = error.message || 'GitHub sign in failed.';
    }
  }
}
