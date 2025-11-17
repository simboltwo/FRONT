import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PeiService } from '../../../core/services/pei.service';
import { PeiInsert } from '../../../core/models/pei.model';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/usuario.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-pei-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pei-form.component.html',
  styleUrls: ['./pei-form.component.scss']
})
export class PeiForm implements OnInit {
  @Input() alunoId!: number;
  @Output() peiSalvo = new EventEmitter<void>();

  protected peiForm!: FormGroup;
  protected isLoading = false;
  protected errorMessage: string | null = null;
  protected successMessage: string | null = null;

  private fb = inject(FormBuilder);
  private peiService = inject(PeiService);
  private authService = inject(AuthService);

  private currentUser: Usuario | null = null;

  ngOnInit(): void {
    if (!this.alunoId) {
      this.errorMessage = "Erro: ID do Aluno não fornecido.";
      return;
    }

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.peiForm = this.fb.group({
      dataInicio: ['', [Validators.required]],
      dataFim: [''],
      metas: ['', [Validators.required, Validators.minLength(5)]],
      estrategias: ['', [Validators.required, Validators.minLength(5)]],
      avaliacao: ['']
    });
  }

  get form() { return this.peiForm; }

  async onSubmit(): Promise<void> {
    if (this.peiForm.invalid || !this.currentUser) {
      this.errorMessage = "Formulário inválido. Verifique os campos obrigatórios.";
      this.successMessage = null;
      this.peiForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload: PeiInsert = {
      ...this.peiForm.value,
      alunoId: this.alunoId,
      responsavelId: this.currentUser.id
    };

    this.peiService.create(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = "PEI salvo com sucesso!";
        this.peiForm.reset();

        setTimeout(() => {
            this.peiSalvo.emit();
            this.successMessage = null; // Limpa a msg ao fechar
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Erro ao salvar o PEI.";
        this.isLoading = false;
      }
    });
  }
}
