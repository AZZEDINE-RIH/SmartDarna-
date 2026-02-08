import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../theme.service';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  taxId: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  avatar: string;
  role: 'admin' | 'seller' | 'user';
  createdAt: string;
  lastLogin: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  private themeSub!: Subscription;

  profileForm!: FormGroup;
  isEditing = false;
  isSaving = false;
  saveSuccess = false;

  @ViewChild('avatarUpload') avatarUpload!: ElementRef<HTMLInputElement>;

  // Mock user data - in real app this would come from API
  currentUser: UserProfile = {
    id: 'user-001',
    firstName: 'Sara',
    lastName: 'Jamal',
    email: 'Sara@example.com',
    phone: '+212 612-345678',
    company: 'SmartDarna Inc.',
    taxId: 'TN123456789',
    address: '123 Business Avenue',
    city: 'Ouarzazte',
    country: 'Morocco',
    postalCode: '1000',
    avatar: '👤',
    role: 'seller',
    createdAt: '2023-01-15',
    lastLogin: '2024-02-08 14:30'
  };

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeSub = this.themeService.isDarkMode$.subscribe(
      (value: boolean) => (this.isDarkMode = value)
    );
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.themeSub.unsubscribe();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      firstName: [this.currentUser.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [this.currentUser.lastName, [Validators.required, Validators.minLength(2)]],
      email: [this.currentUser.email, [Validators.required, Validators.email]],
      phone: [this.currentUser.phone, [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]+$/)]],
      company: [this.currentUser.company, Validators.required],
      taxId: [this.currentUser.taxId, [Validators.required, Validators.pattern(/^[A-Z0-9]+$/)]],
      address: [this.currentUser.address, Validators.required],
      city: [this.currentUser.city, Validators.required],
      country: [this.currentUser.country, Validators.required],
      postalCode: [this.currentUser.postalCode, [Validators.required, Validators.minLength(3)]]
    });
  }

  enableEditing(): void {
    this.isEditing = true;
    this.saveSuccess = false;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.profileForm.reset(this.currentUser);
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isSaving = true;

    // Simulate API call
    setTimeout(() => {
      // Update current user with form values
      this.currentUser = {
        ...this.currentUser,
        ...this.profileForm.value
      };

      this.isSaving = false;
      this.isEditing = false;
      this.saveSuccess = true;

      // Hide success message after 3 seconds
      setTimeout(() => {
        this.saveSuccess = false;
      }, 3000);
    }, 1500);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getRoleDisplay(role: string): string {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrator',
      'seller': 'Seller',
      'user': 'Regular User'
    };
    return roleMap[role] || role;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // In a real app, you would upload the file to a server
      // For now, we'll just use a placeholder
      this.currentUser.avatar = '👤';
    }
  }

  triggerAvatarUpload(): void {
    this.avatarUpload.nativeElement.click();
  }

  // Helper method to get form control for easier template access
  getControl(name: string) {
    return this.profileForm.get(name);
  }
}
