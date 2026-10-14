import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Authentication } from './services/authentication';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Authentication);
  const router = inject(Router);
  const token = auth.token();
  const authorizedRequest = token && req.url.startsWith('http://localhost:3000/api/');
  const request = authorizedRequest
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(catchError((error: HttpErrorResponse) => {
    if ((error.status === 401 || error.status === 403) && authorizedRequest) {
      auth.clearSession();
      router.navigate(['/login'], { queryParams: { reason: 'session' } });
    }
    return throwError(() => error);
  }));
};
