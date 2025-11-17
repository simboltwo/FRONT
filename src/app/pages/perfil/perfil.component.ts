import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {

  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);

  protected detailsForm!: FormGroup;
  protected passwordForm!: FormGroup;

  protected isLoadingDetails = false;
  protected isPasswordLoading = false;

  protected successMessage: string | null = null;
  protected errorMessage: string | null = null;
  protected passwordSuccessMessage: string | null = null;
  protected passwordErrorMessage: string | null = null;

  constructor() {
    this.detailsForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      senhaAtual: ['', [Validators.required]],
      novaSenha: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      confirmacaoNovaSenha: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.detailsForm.patchValue({
          nome: user.nome,
          email: user.email
        });
      }
    });
  }

  protected onDetailsSubmit(): void {
    if (this.detailsForm.invalid) return;

    this.isLoadingDetails = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.usuarioService.updateSelfDetails(this.detailsForm.value)
      .pipe(finalize(() => this.isLoadingDetails = false))
      .subscribe({
        next: (usuarioAtualizado) => {
          this.successMessage = "Dados atualizados com sucesso!";
          this.authService.validateTokenAndLoadUser();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erro ao atualizar dados.';
        }
      });
  }

  protected onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordErrorMessage = "Formulário inválido.";
      return;
    }

    if (this.passwordForm.value.novaSenha !== this.passwordForm.value.confirmacaoNovaSenha) {
      this.passwordErrorMessage = "A 'Nova Senha' e a 'Confirmação' não são iguais.";
      return;
    }

    this.isPasswordLoading = true;
    this.passwordSuccessMessage = null;
    this.passwordErrorMessage = null;

    this.usuarioService.updateSelfPassword(this.passwordForm.value)
      .pipe(finalize(() => this.isPasswordLoading = false))
      .subscribe({
        next: () => {
          this.passwordSuccessMessage = "Senha alterada com sucesso!";
          this.passwordForm.reset();
        },
        error: (err) => {
          this.passwordErrorMessage = err.error?.message || 'Erro ao alterar senha.';
        }
      });
  }
}
