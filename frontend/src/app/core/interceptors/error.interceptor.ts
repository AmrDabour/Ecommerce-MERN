import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/ui/toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const message: string =
        err.error?.msg || err.error?.message || err.message || 'Something went wrong';

      switch (err.status) {
        case 400:
          toast.error(message);
          break;
        case 401:
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('ecommerce_token');
          localStorage.removeItem('ecommerce_user');
          router.navigate(['/login']);
          break;
        case 403:
          toast.error('Access denied. You do not have permission.');
          break;
        case 404:
          toast.error(message || 'Resource not found.');
          break;
        case 500:
        default:
          toast.error(message || 'Server error. Please try again.');
          break;
      }

      return throwError(() => err);
    }),
  );
};
