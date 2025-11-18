/*
 * Arquivo: simboltwo/front/FRONT-6ada510ac5875a89a10169e7efd5d09b58529961/src/app/app.routes.ts
 * Descrição: Registra o novo 'ATENDIMENTOS_ROUTES'.
 */
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
      {
        path: 'inicio',
        title: 'Início',
        loadComponent: () => import('./pages/inicio/inicio.component').then(m => m.InicioComponent)
      },
      {
        path: 'perfil',
        title: 'Meu Perfil',
        loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
      },
      {
        path: 'alunos',
        loadChildren: () => import('./pages/alunos.routes').then(m => m.ALUNOS_ROUTES)
      },

      // --- INÍCIO DA MUDANÇA ---
      {
        path: 'atendimentos',
        loadChildren: () => import('./pages/atendimentos.routes').then(m => m.ATENDIMENTOS_ROUTES)
      },
      // --- FIM DA MUDANÇA ---

      {
        path: 'cadastros',
        loadChildren: () => import('./pages/cadastros.routes').then(m => m.CADASTROS_ROUTES)
      },
      {
        path: 'relatorios',
        loadChildren: () => import('./pages/relatorios.routes').then(m => m.RELATORIOS_ROUTES)
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**', // Rota coringa
    redirectTo: ''
  }
];
