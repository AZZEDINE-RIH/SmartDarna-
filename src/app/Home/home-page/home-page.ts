import { Component } from '@angular/core';
import { FeaturesSection } from '../features-section/features-section';
import { HeroSectionComponent } from '../hero-section/hero-section';
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FeaturesSection, HeroSectionComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

}
