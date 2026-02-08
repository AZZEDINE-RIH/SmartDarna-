import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, SignUpData } from '../../services/auth.service';

@Component({
  selector: 'app-auth-swap',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth-swap.component.html',
  styleUrl: './auth-swap.component.css'
})
export class AuthSwapComponent implements AfterViewInit, OnDestroy {
  mode: 'login' | 'register' = 'login';

  loginEmail = '';
  loginPassword = '';

  registerData: SignUpData = {
    email: '',
    password: '',
    name: '',
    role: 'user'
  };
  confirmPassword = '';

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  @ViewChild('shell', { read: ElementRef })
  private shellRef?: ElementRef<HTMLElement>;

  @ViewChild('loginCard', { read: ElementRef })
  private loginCardRef?: ElementRef<HTMLElement>;

  @ViewChild('registerCard', { read: ElementRef })
  private registerCardRef?: ElementRef<HTMLElement>;

  private gsap: any | null = null;
  private introTl: any | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {
    this.route.paramMap.subscribe((params) => {
      const raw = params.get('mode');
      const next: 'login' | 'register' = raw === 'register' ? 'register' : 'login';

      const shouldAnimate = this.gsap && next !== this.mode;
      this.mode = next;
      if (shouldAnimate) {
        this.animateSwap(true);
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (typeof window === 'undefined') return;

    const gsap = await this.getGsap();
    if (!gsap) return;

    const shell = this.shellRef?.nativeElement;
    const loginCard = this.loginCardRef?.nativeElement;
    const registerCard = this.registerCardRef?.nativeElement;

    if (shell) {
      gsap.set(shell, { opacity: 0, y: 18, scale: 0.99 });
    }

    if (loginCard) {
      gsap.set(loginCard, { opacity: 1 });
    }
    if (registerCard) {
      gsap.set(registerCard, { opacity: 1 });
    }

    this.introTl = gsap.timeline();
    if (shell) {
      this.introTl.to(shell, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }, 0);
    }

    this.animateSwap(false);
  }

  ngOnDestroy(): void {
    const gsap = this.gsap;
    this.introTl?.kill();

    const shell = this.shellRef?.nativeElement;
    const loginCard = this.loginCardRef?.nativeElement;
    const registerCard = this.registerCardRef?.nativeElement;

    if (gsap) {
      gsap.killTweensOf([shell, loginCard, registerCard].filter(Boolean));
    }
  }

  goTo(mode: 'login' | 'register'): void {
    if (mode === this.mode) return;
    this.errorMessage = '';
    this.successMessage = '';

    this.router.navigate(['/auth', mode]);
  }


  async submitLogin(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage = 'Please enter both email and password.';
      this.isLoading = false;
      return;
    }

    try {
      await this.authService.signIn(this.loginEmail, this.loginPassword);
    } catch (error: any) {
      this.errorMessage = error.message || 'Login failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async submitRegister(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.isLoading = false;
      return;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      this.isLoading = false;
      return;
    }

    try {
      await this.authService.signUp(this.registerData);
      this.successMessage = 'Registration successful! Please check your email to verify your account.';

      setTimeout(() => {
        this.ngZone.run(() => {
          this.goTo('login');
        });
      }, 1200);
    } catch (error: any) {
      this.errorMessage = error.message || 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async signInWithGithub(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.signInWithGithub();
    } catch (error: any) {
      this.errorMessage = error.message || 'GitHub sign in failed.';
    } finally {
      this.isLoading = false;
    }
  }

  get isFormValid(): boolean {
    return !!(
      this.registerData.email &&
      this.registerData.password &&
      this.confirmPassword &&
      this.registerData.name &&
      this.registerData.password === this.confirmPassword &&
      this.registerData.password.length >= 6
    );
  }

  private animateSwap(animate: boolean): void {
    const gsap = this.gsap;
    if (!gsap) return;

    const loginCard = this.loginCardRef?.nativeElement;
    const registerCard = this.registerCardRef?.nativeElement;

    if (!loginCard || !registerCard) return;

    const active = this.mode === 'login' ? loginCard : registerCard;
    const inactive = this.mode === 'login' ? registerCard : loginCard;

    const duration = animate ? 0.7 : 0;

    gsap.set(active, { zIndex: 2 });
    gsap.set(inactive, { zIndex: 1 });

    gsap.to(active, {
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      boxShadow: '0 22px 55px rgba(15, 23, 42, 0.20)',
      duration,
      ease: 'power3.out'
    });

    gsap.to(inactive, {
      x: 130,
      y: 16,
      scale: 0.96,
      rotate: 1.25,
      boxShadow: '0 16px 38px rgba(15, 23, 42, 0.14)',
      duration,
      ease: 'power3.out'
    });

    gsap.fromTo(
      inactive,
      { opacity: 0.88 },
      { opacity: 1, duration: animate ? 0.35 : 0, ease: 'power2.out' }
    );
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
}
