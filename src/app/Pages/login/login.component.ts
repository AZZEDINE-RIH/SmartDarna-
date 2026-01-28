import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    email = '';
    password = '';
    isLoading = false;
    error = '';
    returnUrl = '/';

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    onSubmit() {
        if (!this.email || !this.password) {
            this.error = 'Please enter your email and password.';
            return;
        }

        this.isLoading = true;
        this.error = '';

        // Simulate API delay
        setTimeout(() => {
            this.authService.login({
                id: 'u' + Math.floor(Math.random() * 1000),
                name: 'SmartDarna User',
                email: this.email,
                phone: '+212 600 000 000'
            });

            this.isLoading = false;
            this.router.navigateByUrl(this.returnUrl);
        }, 1500);
    }
}
