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
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class LayoutComponent implements OnInit { // MUDANÇA: Implementado OnInit
  protected authService = inject(AuthService);
  protected router = inject(Router);
  protected currentUser$: Observable<Usuario | null>;

  protected isNavbarScrolled = false;

  // MUDANÇA: Variável 'isDashboard' restaurada
  protected isDashboard = false;

  constructor() {
    this.currentUser$ = this.authService.currentUser$;
  }

  // MUDANÇA: Método ngOnInit restaurado
  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Verifica se a URL atual é exatamente /dashboard
      this.isDashboard = event.urlAfterRedirects === '/dashboard';
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // MUDANÇA: Lógica de scroll original restaurada
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
