import { AfterViewInit, Component } from '@angular/core';
import gsap from 'gsap';

@Component({
  selector: 'app-features-section',
  templateUrl: './features-section.html',
  styleUrls: ['./features-section.css']
})
export class FeaturesSectionComponent implements AfterViewInit {

  ngAfterViewInit() {
    gsap.from('.about-image, .about-content', {
      opacity: 0,
      y: 40,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top 80%'
      }
    });
  }
}
