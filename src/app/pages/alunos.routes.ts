import { Routes } from '@angular/router';

export const ALUNOS_ROUTES: Routes = [
  {
    path: '',
    title: 'Alunos',
    // Componente de Listagem
    loadComponent: () => import('./alunos/aluno-list/aluno-list.component').then(m => m.AlunoListComponent)
  },
  {
    path: 'novo',
    title: 'Novo Aluno',
    // Componente do Formulário (Wizard)
    loadComponent: () => import('./alunos/aluno-form/aluno-form.component').then(m => m.AlunoFormComponent)
  },
  {
    path: 'detalhe/:id',
    title: 'Detalhe do Aluno',
    // Componente de Detalhe (que terá os atendimentos)
    loadComponent: () => import('./alunos/aluno-detalhe/aluno-detalhe.component').then(m => m.AlunoDetalheComponent)
  },
  {
    path: 'editar/:id',
    title: 'Editar Aluno',
    loadComponent: () => import('./alunos/aluno-form/aluno-form.component').then(m => m.AlunoFormComponent)
  }
];
