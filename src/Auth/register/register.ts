import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseAuthService } from '../../app/services/supabase-auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(false);
  isFlipped = signal(false);

  private supabaseAuthService = inject(SupabaseAuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirm: ['', [Validators.required]],
      role: ['', [Validators.required]],
      phone: [''],
      address: ['']
    }, { validators: this.passwordMatchValidator });
  }

  toggleFlip(): void {
    this.isFlipped.set(!this.isFlipped());
    this.router.navigate(['/login']);
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      this.errorMessage.set('Please fill in all required fields correctly');
      this.successMessage.set('');
      return;
    }

    const formValues = this.registerForm.value;
    const { name, email, password, role, phone, address } = formValues;

    // Clear messages and set loading
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);

    try {
      // Register with Supabase
      const result = await this.supabaseAuthService.signUp(email, password, name, phone || undefined, address || undefined, role);

      if (result.success) {
        this.successMessage.set('Registration successful! Redirecting to login...');
        console.log('✅ User registered successfully:', result.data);
        
        // Redirect to login after successful registration
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      } else {
        // Handle error message from different error types
        let errorMsg = 'Registration failed. Please try again.';
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMsg = result.error;
          } else if (typeof result.error === 'object' && result.error !== null && 'message' in result.error) {
            errorMsg = (result.error as any).message;
          }
        }
        this.errorMessage.set(errorMsg);
        console.error('❌ Registration error:', result.error);
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Registration failed. Please try again.';
      this.errorMessage.set(errorMsg);
      console.error('❌ Unexpected error during registration:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const passwordConfirm = form.get('passwordConfirm')?.value;
    
    if (password && passwordConfirm && password !== passwordConfirm) {
      form.get('passwordConfirm')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}