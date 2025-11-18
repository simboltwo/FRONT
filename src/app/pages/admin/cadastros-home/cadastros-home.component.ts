import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-cadastros-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cadastros-home.component.html',
  styleUrls: ['./cadastros-home.component.scss']
})
export class CadastrosHomeComponent {
  private authService = inject(AuthService);
  protected isCoordenador$: Observable<boolean>;

  constructor() {
    // Reutilizamos a lógica de permissão para exibir o card de "Usuários"
    this.isCoordenador$ = this.authService.currentUser$.pipe(
      map(user => user?.papeis.some(p => p.authority === 'ROLE_COORDENADOR_NAAPI') || false)
    );
  }
}
