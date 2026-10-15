import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.refreshSession().pipe(
    map((valid) =>
      valid ||
      router.createUrlTree(['/login'], {
        queryParams: {
          redirectTo: state.url,
        },
      }),
    ),
  );
};