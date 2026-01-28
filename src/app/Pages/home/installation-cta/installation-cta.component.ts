import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-installation-cta',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './installation-cta.component.html',
    styleUrl: './installation-cta.component.css'
})
export class InstallationCtaComponent { }
