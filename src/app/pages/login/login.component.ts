// simboltwo/front/FRONT-1d1f337dbd84856e8182e0990ac761d5b6a227e6/src/app/pages/login/login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter, take } from 'rxjs/operators'; // Necessário para a lógica de redirecionamento

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  protected loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]]
  });

  protected isLoading = false;
  protected errorMessage: string | null = null;

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const { email, senha } = this.loginForm.value;

    this.authService.login(email!, senha!).subscribe({
      next: (success) => {
        if (success) {
          // Após o sucesso do login, espera o usuário ser carregado no service
          this.authService.currentUser$.pipe(
              filter(u => !!u), // Espera até que o usuário não seja nulo
              take(1)
          ).subscribe(user => {
              // Usa a lógica do service para decidir o redirecionamento
              this.authService.redirectToLandingPage(user!);
          });
        } else {
          this.errorMessage = "Email ou senha inválidos.";
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Erro de conexão. Tente novamente.";
      }
    });
  }
}
