import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../theme.service';

export interface DeclarationType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-new-declaration-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './new-declaration-form.html',
  styleUrl: './new-declaration-form.css',
})
export class NewDeclarationFormComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  private themeSub!: Subscription;

  declarationForm!: FormGroup;
  isSubmitting = false;
  submitted = false;

  declarationTypes: DeclarationType[] = [
    {
      id: 'vat',
      name: 'VAT Declaration',
      description: 'Monthly or quarterly Value Added Tax declaration',
      icon: '📊'
    },
    {
      id: 'sales',
      name: 'Sales Report',
      description: 'Monthly sales and revenue report',
      icon: '💰'
    },
    {
      id: 'import',
      name: 'Import License',
      description: 'Import/Export license application or renewal',
      icon: '🚢'
    },
    {
      id: 'compliance',
      name: 'Compliance Audit',
      description: 'Regulatory compliance documentation',
      icon: '📋'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeSub = this.themeService.isDarkMode$.subscribe(
      value => (this.isDarkMode = value)
    );
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.themeSub.unsubscribe();
  }

  private initializeForm(): void {
    this.declarationForm = this.fb.group({
      declarationType: ['', Validators.required],
      period: ['', Validators.required],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(2020), Validators.max(2030)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      attachments: [[]],
      agreeToTerms: [false, Validators.requiredTrue]
    });
  }

  onDeclarationTypeChange(type: string): void {
    const periodControl = this.declarationForm.get('period');
    const descriptionControl = this.declarationForm.get('description');

    // Update placeholder based on declaration type
    switch (type) {
      case 'vat':
        periodControl?.setValidators([Validators.required]);
        descriptionControl?.setValue('VAT declaration for the specified period including all taxable transactions.');
        break;
      case 'sales':
        periodControl?.setValidators([Validators.required]);
        descriptionControl?.setValue('Monthly sales report including total revenue, taxes collected, and customer transactions.');
        break;
      case 'import':
        periodControl?.setValidators([Validators.required]);
        descriptionControl?.setValue('Import license application for goods and materials to be imported during the specified period.');
        break;
      case 'compliance':
        periodControl?.setValidators([Validators.required]);
        descriptionControl?.setValue('Compliance audit documentation demonstrating adherence to regulatory requirements.');
        break;
      default:
        descriptionControl?.setValue('');
    }
    periodControl?.updateValueAndValidity();
    descriptionControl?.updateValueAndValidity();
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    const attachments = this.declarationForm.get('attachments')?.value || [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size <= 5 * 1024 * 1024) { // 5MB limit
        attachments.push({
          name: file.name,
          size: file.size,
          type: file.type,
          file: file
        });
      }
    }
    
    this.declarationForm.get('attachments')?.setValue(attachments);
  }

  removeAttachment(index: number): void {
    const attachments = this.declarationForm.get('attachments')?.value || [];
    attachments.splice(index, 1);
    this.declarationForm.get('attachments')?.setValue(attachments);
  }

  onSubmit(): void {
    if (this.declarationForm.invalid) {
      this.markFormGroupTouched(this.declarationForm);
      return;
    }

    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitted = true;
      
      // Reset form after 3 seconds
      setTimeout(() => {
        this.submitted = false;
        this.declarationForm.reset();
        this.initializeForm();
      }, 3000);
    }, 2000);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getSelectedDeclarationType(): DeclarationType | undefined {
    const typeId = this.declarationForm.get('declarationType')?.value;
    return this.declarationTypes.find(type => type.id === typeId);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  clearForm(): void {
    this.declarationForm.reset();
    this.initializeForm();
  }
}
