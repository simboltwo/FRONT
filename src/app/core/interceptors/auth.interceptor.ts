import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getAuthToken(); // Já vem como "Bearer <token>"

  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        'Authorization': authToken
      }
    });
    return next(authReq);
  }

  return next(req);
};
