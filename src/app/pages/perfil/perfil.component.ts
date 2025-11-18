/*
 * Arquivo: simboltwo/front/FRONT-6ada510ac5875a89a10169e7efd5d09b58529961/src/app/pages/perfil/perfil.component.ts
 * Descrição: Removidas variáveis de erro/sucesso e injetado o ToastService.
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';
import { finalize } from 'rxjs';
import { ToastService } from '../../core/services/toast.service'; // --- INÍCIO DA MUDANÇA ---

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
  private toastService = inject(ToastService); // --- INÍCIO DA MUDANÇA ---

  protected detailsForm!: FormGroup;
  protected passwordForm!: FormGroup;

  protected isLoadingDetails = false;
  protected isPasswordLoading = false;

  // --- INÍCIO DA MUDANÇA: Variáveis removidas ---
  // protected successMessage: string | null = null;
  // protected errorMessage: string | null = null;
  // protected passwordSuccessMessage: string | null = null;
  // protected passwordErrorMessage: string | null = null;
  // --- FIM DA MUDANÇA ---

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
    // --- MUDANÇA: Limpa mensagens antigas (se houver) ---
    // this.successMessage = null;
    // this.errorMessage = null;

    this.usuarioService.updateSelfDetails(this.detailsForm.value)
      .pipe(finalize(() => this.isLoadingDetails = false))
      .subscribe({
        next: (usuarioAtualizado) => {
          // --- MUDANÇA: Usa o ToastService ---
          this.toastService.show("Dados atualizados com sucesso!", 'success');
          this.authService.validateTokenAndLoadUser();
        },
        error: (err) => {
          // --- MUDANÇA: Usa o ToastService ---
          this.toastService.show(err.error?.message || 'Erro ao atualizar dados.', 'danger');
        }
      });
  }

  protected onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
       // --- MUDANÇA: Usa o ToastService ---
      this.toastService.show("Formulário inválido.", 'danger');
      return;
    }

    if (this.passwordForm.value.novaSenha !== this.passwordForm.value.confirmacaoNovaSenha) {
       // --- MUDANÇA: Usa o ToastService ---
      this.toastService.show("A 'Nova Senha' e a 'Confirmação' não são iguais.", 'danger');
      return;
    }

    this.isPasswordLoading = true;
    // --- MUDANÇA: Limpa mensagens antigas (se houver) ---
    // this.passwordSuccessMessage = null;
    // this.passwordErrorMessage = null;

    this.usuarioService.updateSelfPassword(this.passwordForm.value)
      .pipe(finalize(() => this.isPasswordLoading = false))
      .subscribe({
        next: () => {
           // --- MUDANÇA: Usa o ToastService ---
          this.toastService.show("Senha alterada com sucesso!", 'success');
          this.passwordForm.reset();
        },
        error: (err) => {
           // --- MUDANÇA: Usa o ToastService ---
          this.toastService.show(err.error?.message || 'Erro ao alterar senha.', 'danger');
        }
      });
  }
}
