import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Observable } from 'rxjs';
import { Usuario } from '../core/models/usuario.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink], // RouterOutlet é essencial
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'] // Crie este ficheiro
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
