import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth-user.model';

export const RoleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.refreshSession().pipe(
    map((valid) => {
      if (!valid) {
        return router.createUrlTree(['/login'], {
          queryParams: {
            redirectTo: state.url,
          },
        });
      }

      const roles = (route.data['roles'] ?? []) as UserRole[];

      return roles.length > 0 && auth.hasRole(roles)
        ? true
        : router.createUrlTree(['/dashboard']);
    }),
  );
};