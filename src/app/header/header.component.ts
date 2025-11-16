// src/app/layout/layout.component.ts
import { Component, inject, HostListener, signal } from '@angular/core'; // MUDANÇA: Importa 'signal' e 'HostListener'
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
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class LayoutComponent {
  protected authService = inject(AuthService);
  protected router = inject(Router);
  protected currentUser$: Observable<Usuario | null>;

  // --- Lógica para transparência da Navbar ---
  protected isScrolledOrHovered = signal(false);
  private isHovering = false;
  private scrollThreshold = 10; // Pixels a rolar antes de mudar a cor

  constructor() {
    this.currentUser$ = this.authService.currentUser$;
  }

  /** Ouve o evento de scroll da janela */
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.updateNavbarState();
  }

  /** Ouve o rato a entrar na navbar */
  @HostListener('mouseenter')
  onMouseEnter() {
    this.isHovering = true;
    this.updateNavbarState();
  }

  /** Ouve o rato a sair da navbar */
  @HostListener('mouseleave')
  onMouseLeave() {
    this.isHovering = false;
    this.updateNavbarState();
  }

  /** Função central que atualiza o signal */
  private updateNavbarState() {
    const isScrolled = window.pageYOffset > this.scrollThreshold;
    this.isScrolledOrHovered.set(isScrolled || this.isHovering);
  }
  // --- Fim da Lógica ---

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
