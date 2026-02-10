import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer {
  constructor(private router: Router) {}

  scrollToTop(route: string) {
    this.router.navigate([route]).then(() => {
      window.scrollTo(0, 0);
    });
  }
}
