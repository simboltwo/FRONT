import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] // Crie este arquivo .scss
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  protected loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]]
  });

  protected currentYear = new Date().getFullYear();
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
          // Sucesso! Navega para a página principal
          this.router.navigate(['/dashboard']);
        } else {
          // Falha (controlada pelo service)
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
