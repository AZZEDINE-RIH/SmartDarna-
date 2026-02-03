import { Component } from '@angular/core';
// import { FeaturesSectionComponent } from '../features-section/features-section';
import { HeroSectionComponent } from '../hero-section/hero-section';
import { WhyChooseComponent } from '../why-choose/why-choose.component';
import { InstallationCtaComponent } from '../installation-cta/installation-cta.component';
import { BestSellersComponent } from '../best-sellers/best-sellers.component';
import { CustomerReviewsComponent } from '../customer-reviews/customer-reviews.component';
import { BrandSliderComponent } from '../brand-slider/brand-slider.component';


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [HeroSectionComponent, WhyChooseComponent, InstallationCtaComponent, BestSellersComponent, CustomerReviewsComponent, BrandSliderComponent],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css'],
})
export class HomePage {

}
