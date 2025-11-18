/*
 * Arquivo NOVO: simboltwo/front/FRONT-6ada510ac5875a89a10169e7efd5d09b58529961/src/app/pages/atendimentos.routes.ts
 * Descrição: Define a rota para a nova página de gerenciamento de atendimentos.
 */
import { Routes } from '@angular/router';

export const ATENDIMENTOS_ROUTES: Routes = [
  {
    path: '',
    title: 'Meus Atendimentos',
    loadComponent: () => import('../pages/atendimentos/atendimento-gerenciar/atendimento-gerenciar.component').then(m => m.AtendimentoGerenciarComponent)
  }
];
