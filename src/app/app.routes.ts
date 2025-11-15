import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './header/header.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    // Rota "pai" que usa o LayoutComponent
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'alunos',
        // As rotas de alunos agora são "filhas" do layout
        loadChildren: () => import('./pages/alunos.routes').then(m => m.ALUNOS_ROUTES)
      },
      // (Adicionar rotas futuras para /cursos, /diagnosticos, /relatorios aqui)
      {
        path: '',
        redirectTo: 'dashboard', // MUDANÇA: O padrão agora é o dashboard
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**', // Rota coringa
    redirectTo: ''
  }
];
