// src/app/layout/layout.component.ts
import { Component, inject, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
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
export class LayoutComponent implements OnInit { // MUDANÇA: Pode remover OnInit se não for mais usado
  protected authService = inject(AuthService);
  protected router = inject(Router);
  protected currentUser$: Observable<Usuario | null>;

  // --- MUDANÇA: Estas propriedades não são mais usadas pelo novo CSS ---
  // protected isNavbarScrolled = false;
  // protected isDashboard = false;
  // --- FIM DA MUDANÇA ---

  constructor() {
    this.currentUser$ = this.authService.currentUser$;
  }

  // --- MUDANÇA: Este ngOnInit pode ser removido ---
  // A lógica do 'isDashboard' não é mais necessária para o estilo
  ngOnInit(): void {
    // this.router.events.pipe(
    //   filter(event => event instanceof NavigationEnd)
    // ).subscribe((event: any) => {
    //   this.isDashboard = event.urlAfterRedirects === '/dashboard';
    // });
  }

  // --- MUDANÇA: Este HostListener pode ser removido ---
  // @HostListener('window:scroll', [])
  // onWindowScroll() {
  //   const scrollOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  //   const scrollTrigger = this.isDashboard ? 50 : 10;
  //   this.isNavbarScrolled = scrollOffset > scrollTrigger;
  // }

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
