import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional (novo padrão do Angular)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authHeader = authService.getAuthHeader();

  // Se tivermos um cabeçalho de login, clona a requisição e o adiciona
  if (authHeader) {
    const authReq = req.clone({
      setHeaders: {
        'Authorization': authHeader
      }
    });
    return next(authReq);
  }

  // Se não, apenas continua com a requisição original (que provavelmente será barrada pela API)
  return next(req);
};
