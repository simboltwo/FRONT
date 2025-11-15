import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';
import { Usuario } from '../core/models/usuario.model';
import * as bootstrap from 'bootstrap';
// Removemos a importação de AlunoListComponent que não é usada aqui

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class LayoutComponent { // Removemos OnInit
  protected authService = inject(AuthService);
  protected router = inject(Router);
  protected currentUser$: Observable<Usuario | null>;

  // Removemos isNavbarScrolled e isDashboard

  constructor() {
    this.currentUser$ = this.authService.currentUser$;
  }

  // Removemos ngOnInit e onWindowScroll

  // Ação de Logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Função para fechar o menu mobile (offcanvas)
  closeOffcanvas(): void {
    const menuElement = document.getElementById('naapiOffcanvasMenu');
    if (menuElement) {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(menuElement);
      if (bsOffcanvas) {
        bsOffcanvas.hide();
      }
    }
  }

  // Combina as duas ações para o botão "Sair" do mobile
  logoutAndCloseOffcanvas(): void {
    this.closeOffcanvas();
    this.logout();
  }
}
