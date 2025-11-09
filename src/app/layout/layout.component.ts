import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router'; // <-- IMPORTE RouterLinkActive
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';
import { Usuario } from '../core/models/usuario.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive // <-- ADICIONE AQUI
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'] // Vamos criar este ficheiro
})
export class LayoutComponent {
  protected authService = inject(AuthService);
  protected router = inject(Router);

  // Observável para o utilizador logado
  protected currentUser$: Observable<Usuario | null>;

  constructor() {
    this.currentUser$ = this.authService.currentUser$;
  }

  // Ação de Logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
