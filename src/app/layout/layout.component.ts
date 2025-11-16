import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';
import { Usuario } from '../core/models/usuario.model';
import * as bootstrap from 'bootstrap';
import { AlunoListComponent } from "../pages/alunos/aluno-list/aluno-list.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AlunoListComponent
],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  protected authService = inject(AuthService);
  protected router = inject(Router);
  protected currentUser$: Observable<Usuario | null>;

  // Variável para controlar o estado da navbar
  protected isNavbarScrolled = false;

  constructor() {
    this.currentUser$ = this.authService.currentUser$;
  }

  // Listener que observa o scroll da janela (CORRIGIDO)
  @HostListener('window:scroll', []) // Sem '$event'
  onWindowScroll() { // Sem o parâmetro 'event'
    // Verifica a posição do scroll
    const scrollOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // Se o scroll for maior que 10px, ativa a classe
    this.isNavbarScrolled = scrollOffset > 10;
  }

  // Ação de Logout
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
