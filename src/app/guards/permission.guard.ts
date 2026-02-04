import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminPermission, SubAdminPermissionsService } from '../services/sub-admin-permissions.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private permissionsService: SubAdminPermissionsService,
    private router: Router
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const user = await this.authService.getUser();
    if (!user) {
      return this.router.parseUrl(`/login?returnUrl=${encodeURIComponent(state.url)}`);
    }

    const superAdminOnly = !!route.data['superAdminOnly'];
    const requiredPermissions = (route.data['permissions'] || []) as AdminPermission[];

    const isSuperAdmin = await this.permissionsService.isSuperAdmin(user);
    if (isSuperAdmin) {
      return true;
    }

    if (superAdminOnly) {
      return this.router.parseUrl('/dashboard/overview');
    }

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const myPermissions = await this.permissionsService.getMyPermissions();
    const ok = requiredPermissions.every((p) => myPermissions.includes(p));
    return ok ? true : this.router.parseUrl('/dashboard/overview');
  }
}
