// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      // --- INÍCIO DA MUDANÇA ---
      {
        path: 'inicio', // MUDANÇA: de 'dashboard'
        title: 'Início',  // MUDANÇA: de 'Dashboard'
        // MUDANÇA: Aponta para o novo componente
        loadComponent: () => import('./pages/inicio/inicio.component').then(m => m.InicioComponent)
      },
      {
        path: 'perfil',
        title: 'Meu Perfil',
        loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
      },
      // --- FIM DA MUDANÇA ---
      {
        path: 'alunos',
        loadChildren: () => import('./pages/alunos.routes').then(m => m.ALUNOS_ROUTES)
      },
      {
        path: 'cadastros',
        loadChildren: () => import('./pages/cadastros.routes').then(m => m.CADASTROS_ROUTES)
      },
      {
        path: 'relatorios',
        loadChildren: () => import('./pages/relatorios.routes').then(m => m.RELATORIOS_ROUTES)
      },

      // --- INÍCIO DA MUDANÇA ---
      {
        path: '',
        redirectTo: 'inicio', // MUDANÇA: O padrão agora é 'inicio'
        pathMatch: 'full'
      }
      // --- FIM DA MUDANÇA ---
    ]
  },
  {
    path: '**', // Rota coringa
    redirectTo: ''
  }
];
