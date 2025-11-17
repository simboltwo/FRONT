// src/app/pages/cadastros.routes.ts
import { Routes } from '@angular/router';

export const CADASTROS_ROUTES: Routes = [
  {
    path: 'diagnosticos',
    title: 'Gerir Diagnósticos',
    loadComponent: () => import('./admin/diagnostico-admin/diagnostico-admin.component').then(m => m.DiagnosticoAdminComponent)
  },
  {
    path: 'cursos',
    title: 'Gerir Cursos',
    loadComponent: () => import('./admin/curso-admin/curso-admin.component').then(m => m.CursoAdminComponent)
  },
  {
    path: 'turmas',
    title: 'Gerir Turmas',
    loadComponent: () => import('./admin/turma-admin/turma-admin.component').then(m => m.TurmaAdminComponent)
  },
  {
    path: 'tipos-atendimento',
    title: 'Gerir Tipos de Atendimento',
    loadComponent: () => import('./admin/tipo-atendimento-admin/tipo-atendimento-admin.component').then(m => m.TipoAtendimentoAdminComponent)
  },
  {
    path: 'usuarios',
    title: 'Gerir Usuários',
    loadComponent: () => import('./admin/usuario-admin/usuario-admin.component').then(m => m.UsuarioAdminComponent)
  },
  {
    path: '',
    redirectTo: 'diagnosticos',
    pathMatch: 'full'
  }
];
