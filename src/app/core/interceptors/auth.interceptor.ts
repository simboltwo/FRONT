import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional (novo padrão do Angular)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getAuthToken();

  // --- INÍCIO DA CORREÇÃO ---
  // Verifica se a requisição é para a rota de login.
  if (req.url.includes('/api/auth/login')) {
    // Se for, passa a requisição adiante SEM adicionar o token.
    return next(req);
  }
  // --- FIM DA CORREÇÃO ---

  // Se tivermos um token (e NÃO for a rota de login), clona a requisição e o adiciona
  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        'Authorization': authToken // authToken já inclui "Bearer "
      }
    });
    return next(authReq);
  }

  // Se não tiver token, apenas continua (ex: para /health)
  return next(req);
};
