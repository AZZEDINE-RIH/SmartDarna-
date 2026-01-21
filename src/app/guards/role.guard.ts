import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
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
  ): boolean {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if route requires specific roles
    const requiredRoles = route.data['roles'] as string[];
    
    if (requiredRoles && requiredRoles.length > 0) {
      if (this.authService.hasAnyRole(requiredRoles)) {
        return true;
      }

      // User doesn't have required role - redirect to appropriate dashboard
      const user = this.authService.getUser();
      if (user) {
        this.router.navigate([this.getRedirectUrlForRole(user.role)]);
      } else {
        this.router.navigate(['/login']);
      }
      return false;
    }

    return true;
  }

  /**
   * Get redirect URL based on user role
   */
  private getRedirectUrlForRole(role: string): string {
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'vendeur':
        return '/vendeur-dashboard';
      case 'user':
      default:
        return '/home';
    }
  }
}
