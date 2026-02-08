import { Component } from '@angular/core';
// import { FeaturesSectionComponent } from '../features-section/features-section';
import { HeroSectionComponent } from '../hero-section/hero-section';
import { WhyChooseComponent } from '../why-choose/why-choose.component';
import { InstallationCtaComponent } from '../installation-cta/installation-cta.component';
import { BestSellersComponent } from '../best-sellers/best-sellers.component';
import { CustomerReviewsComponent } from '../reviews/reviews.component';
import { TrustedByComponent } from '../trusted-by/trusted-by.component';
import { BrandMarqueeComponent } from '../../../shared/brand-marquee/brand-marquee.component';
import { ValueMarqueeComponent } from '../../../shared/value-marquee/value-marquee.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    HeroSectionComponent,
    WhyChooseComponent,
    TrustedByComponent,
    BrandMarqueeComponent,
    InstallationCtaComponent,
    BestSellersComponent,
    CustomerReviewsComponent,
    ValueMarqueeComponent
  ],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css'],
})
export class HomePage {

}
