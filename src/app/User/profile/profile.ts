import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../theme.service';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';

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
    private themeService: ThemeService,
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.themeSub = this.themeService.isDarkMode$.subscribe(
      (value: boolean) => (this.isDarkMode = value)
    );
    this.initializeForm();
    this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    try {
      console.log('👤 ProfileComponent: Loading profile...');
      const { data: { user } } = await this.supabaseService.getClient().auth.getUser();

      if (!user) {
        console.warn('👤 ProfileComponent: No authenticated user found');
        return;
      }

      console.log('👤 ProfileComponent: User ID:', user.id);

      const { data: profile, error } = await this.supabaseService.getClient()
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('👤 ProfileComponent: Error loading profile:', error);
        return;
      }

      console.log('👤 ProfileComponent: Loaded profile from Supabase:', profile);

      if (profile) {
        // Parse name into firstName and lastName
        const nameParts = (profile.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        this.currentUser = {
          id: profile.id,
          firstName,
          lastName,
          email: profile.email || user.email || '',
          phone: profile.phone || '',
          company: profile.company || '',
          taxId: profile.tax_id || '',
          address: profile.address || '',
          city: profile.city || '',
          country: profile.country || '',
          postalCode: profile.postal_code || '',
          avatar: '👤',
          role: profile.role || 'user',
          createdAt: profile.created_at || new Date().toISOString(),
          lastLogin: profile.updated_at || new Date().toISOString()
        };

        console.log('👤 ProfileComponent: Updated currentUser:', this.currentUser);
        this.initializeForm();
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error in loadProfile:', error);
      this.cdr.detectChanges();
    }
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

  async onSaveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isSaving = true;

    try {
      const { data: { user } } = await this.supabaseService.getClient().auth.getUser();

      if (!user) {
        console.error('No authenticated user');
        this.isSaving = false;
        return;
      }

      const formValue = this.profileForm.value;
      const fullName = `${formValue.firstName} ${formValue.lastName}`.trim();

      const { error } = await this.supabaseService.getClient()
        .from('profiles')
        .update({
          name: fullName,
          phone: formValue.phone,
          company: formValue.company,
          tax_id: formValue.taxId,
          address: formValue.address,
          city: formValue.city,
          country: formValue.country,
          postal_code: formValue.postalCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving profile:', error);
        this.isSaving = false;
        return;
      }

      // Update current user with form values
      this.currentUser = {
        ...this.currentUser,
        ...formValue
      };

      this.isSaving = false;
      this.isEditing = false;
      this.saveSuccess = true;
      this.cdr.detectChanges();

      // Hide success message after 3 seconds
      setTimeout(() => {
        this.saveSuccess = false;
        this.cdr.detectChanges();
      }, 3000);
    } catch (error) {
      console.error('Error in onSaveProfile:', error);
      this.isSaving = false;
    }
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
