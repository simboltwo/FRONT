// src/app/pages/relatorios.routes.ts
import { Routes } from '@angular/router';

export const RELATORIOS_ROUTES: Routes = [
  {
    path: '',
    title: 'Relatórios',
    loadComponent: () => import('../pages/relatorios/relatorio.component').then(m => m.RelatorioComponent)
  }
];
