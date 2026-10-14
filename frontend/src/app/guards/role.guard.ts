import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth-user.model';

function getAllowedRoles(route: ActivatedRouteSnapshot): UserRole[] {
  return (route.data?.['roles'] ?? []) as UserRole[];
}

export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { redirectTo: state.url },
    });
  }

  const allowedRoles = getAllowedRoles(route);
  const currentRole = authService.getUserRole();

  if (!currentRole) {
    return router.createUrlTree(['/login'], {
      queryParams: { redirectTo: state.url },
    });
  }

  if (allowedRoles.length === 0) {
    return true;
  }

  if (allowedRoles.includes(currentRole)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
