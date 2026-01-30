import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const expectedRoles = route.data['roles'] as string[] || [];
    
    return this.authService.currentUser.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        // Since we can't use async in map, we'll use getUserSync for immediate role checking
        const userProfile = this.authService.getUserSync();
        const userRole = userProfile?.role || 'user';
        
        if (expectedRoles.includes(userRole)) {
          return true;
        } else {
          // Redirect based on role
          this.redirectByRole(userRole);
          return false;
        }
      })
    );
  }

  private redirectByRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/dashboard']);
        break;
      case 'seller':
        this.router.navigate(['/vendeur-dashboard']);
        break;
      case 'user':
        this.router.navigate(['/home']);
        break;
      default:
        this.router.navigate(['/home']);
    }
  }
}
