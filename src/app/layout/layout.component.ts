// simboltwo/front/FRONT-1d1f337dbd84856e8182e0990ac761d5b6a227e6/src/app/layout/layout.component.ts

import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Observable, map } from 'rxjs';
import { Usuario } from '../core/models/usuario.model';
import * as bootstrap from 'bootstrap';
import { AlunoListComponent } from "../pages/alunos/aluno-list/aluno-list.component";
import { ToastComponent } from './toast/toast.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AlunoListComponent,
    ToastComponent
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  protected authService = inject(AuthService);
  protected router = inject(Router);
  protected currentUser$: Observable<Usuario | null>;

  protected isCoordenador$: Observable<boolean>;
  protected isMembroOuCoordenador$: Observable<boolean>;
  protected canViewRelatorios$: Observable<boolean>;
  protected canEditAlunos$: Observable<boolean>;
  protected isProfessor$: Observable<boolean>;

  constructor() {
    this.currentUser$ = this.authService.currentUser$;

    this.isProfessor$ = this.currentUser$.pipe(
      map(user => user?.papeis.some(p => p.authority === 'ROLE_PROFESSOR') || false)
    );

    this.isCoordenador$ = this.currentUser$.pipe(
      map(user => user?.papeis.some(p => p.authority === 'ROLE_COORDENADOR_NAAPI') || false)
    );

    this.isMembroOuCoordenador$ = this.currentUser$.pipe(
      map(user => user?.papeis.some(p =>
        p.authority === 'ROLE_COORDENADOR_NAAPI' ||
        p.authority === 'ROLE_MEMBRO_TECNICO'
      ) || false)
    );

    this.canViewRelatorios$ = this.currentUser$.pipe(
      map(user => user?.papeis.some(p =>
        p.authority === 'ROLE_COORDENADOR_NAAPI' ||
        p.authority === 'ROLE_MEMBRO_TECNICO' ||
        p.authority === 'ROLE_ESTAGIARIO_NAAPI' ||
        p.authority === 'ROLE_COORDENADOR_CURSO'
      ) || false)
    );

    this.canEditAlunos$ = this.currentUser$.pipe(
      map(user => user?.papeis.some(p =>
        p.authority === 'ROLE_COORDENADOR_NAAPI' ||
        p.authority === 'ROLE_MEMBRO_TECNICO' ||
        p.authority === 'ROLE_ESTAGIARIO_NAAPI'
      ) || false)
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  closeOffcanvas(): void {
    const menuElement = document.getElementById('naapiOffcanvasMenu');
    if (menuElement) {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(menuElement);
      if (bsOffcanvas) {
        bsOffcanvas.hide();
      }
    }
  }

  logoutAndCloseOffcanvas(): void {
    this.closeOffcanvas();
    this.logout();
  }
}
