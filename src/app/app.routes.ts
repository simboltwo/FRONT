import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component'; // <-- Importe o layout

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    // Rota "pai" que usa o LayoutComponent
    path: '',
    component: LayoutComponent, // <-- Carrega o Layout (Navbar, etc.)
    canActivate: [authGuard], // Protege todas as rotas filhas
    children: [
      {
        path: 'alunos',
        // As rotas de alunos agora são "filhas" do layout
        loadChildren: () => import('./pages/alunos.routes').then(m => m.ALUNOS_ROUTES)
      },
      {
        path: '',
        redirectTo: 'alunos', // Redireciona para /alunos
        pathMatch: 'full'
      }
      // Adicione outras rotas protegidas aqui (ex: /cursos, /diagnosticos)
    ]
  },
  {
    path: '**', // Rota coringa
    redirectTo: ''
  }
];
