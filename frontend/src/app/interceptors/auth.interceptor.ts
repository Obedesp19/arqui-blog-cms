import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.url_api.replace(/\/+$/, '');

  if (
    req.url !== apiUrl &&
    !req.url.startsWith(`${apiUrl}/`)
  ) {
    return next(req);
  }

  const path = req.url.split('?')[0];

  const isPublicAuth =
    req.method === 'POST' &&
    (
      path === `${apiUrl}/token/` ||
      path === `${apiUrl}/users/`
    );

  if (isPublicAuth) {
    return next(req);
  }

  const auth = inject(AuthService);
  const token = auth.getToken();

  const request =
    token && !req.headers.has('Authorization')
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req;

  return next(request).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        token &&
        request.headers.get('Authorization') === `Bearer ${token}` &&
        auth.getToken() === token
      ) {
        auth.clearSession();
      }

      return throwError(() => error);
    }),
  );
};