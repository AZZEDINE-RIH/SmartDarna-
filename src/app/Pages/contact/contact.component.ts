import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.css'
})
export class ContactComponent {
    formData = {
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
    };

    subjects = [
        'General Inquiry',
        'Product Support',
        'Installation Service',
        'Partnership',
        'Other'
    ];

    isSubmitting = false;
    submitted = false;
    errorMessage = '';

    onSubmit() {
        if (this.isFormValid()) {
            this.isSubmitting = true;
            this.errorMessage = '';

            // Simulate API call
            setTimeout(() => {
                this.isSubmitting = false;
                this.submitted = true;

                // Reset form after 5 seconds or on manual close
                // For now, we'll keep the success message visible
            }, 2000);
        } else {
            this.errorMessage = 'Please fill in all required fields correctly.';
        }
    }

    isFormValid(): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return (
            this.formData.name.trim() !== '' &&
            emailRegex.test(this.formData.email) &&
            this.formData.message.trim() !== ''
        );
    }

    resetForm() {
        this.formData = {
            name: '',
            email: '',
            phone: '',
            subject: 'General Inquiry',
            message: ''
        };
        this.submitted = false;
        this.errorMessage = '';
    }
}
