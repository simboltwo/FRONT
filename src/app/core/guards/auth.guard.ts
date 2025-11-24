import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
// MUDANÇA: Importa os operadores corretamente do pipe operators
import { filter, take, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // O Guarda de Rota retorna um Observable<boolean> que decide se a rota pode ser ativada.
  return authService.isInitializing$.pipe(
    // 1. Espera (filtra) até que a inicialização assíncrona termine (isInitializing = false)
    filter(isInitializing => isInitializing === false),
    // 2. Garante que só seja executado uma vez
    take(1),
    // 3. Verifica o estado final do usuário
    map(() => {
        if (authService.isLoggedIn()) {
          return true; // Usuário autenticado, permite a navegação.
        }

        // 4. Usuário não autenticado, redireciona para login.
        router.navigate(['/login']);
        return false;
    })
  );
};
