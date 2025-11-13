// src/app/layout/layout.component.ts
import { Component, inject, HostListener, OnInit } from '@angular/core'; // MUDANÇA: Adicionado OnInit
import { CommonModule } from '@angular/common';
// MUDANÇA: Adicionado Router, NavigationEnd e filter
import { Router, RouterLink, RouterOutlet, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators'; // MUDANÇA: Adicionado filter
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
export class LayoutComponent implements OnInit { // MUDANÇA: Implementado OnInit
  protected authService = inject(AuthService);
  protected router = inject(Router);
  protected currentUser$: Observable<Usuario | null>;

  // Variável para controlar o estado da navbar
  protected isNavbarScrolled = false;

  // MUDANÇA: Nova variável para controlar a rota do dashboard
  protected isDashboard = false;

  constructor() {
    this.currentUser$ = this.authService.currentUser$;
  }

  // MUDANÇA: Novo método ngOnInit para detetar a rota
  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Verifica se a URL atual é exatamente /dashboard
      this.isDashboard = event.urlAfterRedirects === '/dashboard';
    });
  }

  // Listener que observa o scroll da janela
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // MUDANÇA: A lógica de scroll agora é um pouco diferente
    // Se estiver no dashboard, o scroll_ativado é 50. Senão, 10.
    const scrollTrigger = this.isDashboard ? 50 : 10;
    this.isNavbarScrolled = scrollOffset > scrollTrigger;
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
