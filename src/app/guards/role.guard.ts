import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
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
      switchMap((user) => {
        if (!user) {
          this.router.navigate(['/login']);
          return of(null);
        }
        return from(this.authService.getUser());
      }),
      map((userProfile) => {
        const userRole = userProfile?.role || 'user';
        if (expectedRoles.includes(userRole)) {
          return true;
        }

        this.redirectByRole(userRole);
        return false;
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
