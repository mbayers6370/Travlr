import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Authentication } from './services/authentication';
import { environment } from '../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Authentication);
  const router = inject(Router);
  const token = auth.token();
  const authorizedRequest = token && req.url.startsWith(`${environment.apiOrigin}/api/`);
  const request = authorizedRequest
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(catchError((error: HttpErrorResponse) => {
    if (error.status === 401 && authorizedRequest) {
      auth.clearSession();
      router.navigate(['/login'], { queryParams: { reason: 'session' } });
    }
    return throwError(() => error);
  }));
};
