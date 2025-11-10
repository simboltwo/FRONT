import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AtendimentoService } from '../../../core/services/atendimento.service';
import { TipoAtendimentoService, UsuarioService } from '../../../core/services/api.service';
import { TipoAtendimento } from '../../../core/models/aluno.model';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-atendimento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],

  // MUDANÇA: Adicionado styleUrls
  styleUrls: ['./atendimento-form.component.scss'],

  // MUDANÇA: Template atualizado para o design "Flat" do mockup
  template: `
    <div class="form-wrapper-flat">
      <form [formGroup]="atendimentoForm" (ngSubmit)="onSubmit()">
        <h5 class="form-title">Registrar Novo Atendimento</h5>
        <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <div class="row">
          <div class="col-md-6 mb-4">
            <label for="dataHora" class="form-label">
              <i class="bi bi-calendar-event me-1"></i> Data e Hora
            </label>
            <input type="datetime-local" class="form-control" id="dataHora" formControlName="dataHora"
                  placeholder="dd/mm/aaaa ----:----"
                  [class.is-invalid]="form.get('dataHora')!.invalid && form.get('dataHora')!.touched">
          </div>

          <div class="col-md-6 mb-4">
            <label for="tipoAtendimentoId" class="form-label">
              <i class="bi bi-tags me-1"></i> Tipo de Atendimento
            </label>
            <select id="tipoAtendimentoId" class="form-select" formControlName="tipoAtendimentoId"
                    [class.is-invalid]="form.get('tipoAtendimentoId')!.invalid && form.get('tipoAtendimentoId')!.touched">
              <option [ngValue]="null" disabled>Selecione...</option>
              <option *ngFor="let tipo of (tiposAtendimento$ | async)" [ngValue]="tipo.id">
                {{ tipo.nome }}
              </option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-4">
            <label for="status" class="form-label">
              <i class="bi bi-check-circle me-1"></i> Status
            </label>
            <select id="status" class="form-select" formControlName="status">
              <option value="AGENDADO">Agendado</option>
              <option value="REALIZADO">Realizado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>

        <div class="mb-3">
          <label for="descricao" class="form-label">
            <i class="bi bi-pencil-square me-1"></i> Descrição / Observações
          </label>
          <textarea class="form-control" id="descricao" rows="4" formControlName="descricao"
                    placeholder="Digite as observações do atendimento..."
                    [class.is-invalid]="form.get('descricao')!.invalid && form.get('descricao')!.touched"></textarea>
        </div>

        <div class="text-end">
          <button type="submit" class="btn btn-success" [disabled]="atendimentoForm.invalid || isLoading">
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ isLoading ? 'Salvando...' : 'Salvar Atendimento' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class AtendimentoForm implements OnInit {
  // ... (O resto do seu código TypeScript continua aqui, sem alterações) ...
  @Input() alunoId!: number;
  @Output() atendimentoSalvo = new EventEmitter<void>();

  protected atendimentoForm!: FormGroup;
  protected tiposAtendimento$!: Observable<TipoAtendimento[]>;
  protected usuarioLogado!: Usuario;
  protected isLoading = false;
  protected errorMessage: string | null = null;

  private fb = inject(FormBuilder);
  private atendimentoService = inject(AtendimentoService);
  private tipoAtendimentoService = inject(TipoAtendimentoService);
  private usuarioService = inject(UsuarioService);

  ngOnInit(): void {
    if (!this.alunoId) {
      this.errorMessage = "Erro: ID do Aluno não fornecido.";
      return;
    }

    this.usuarioService.getMe().subscribe(user => {
      this.usuarioLogado = user;
    });

    this.tiposAtendimento$ = this.tipoAtendimentoService.findAll();

    // Adiciona o valor padrão 'null' ao tipoAtendimentoId para o placeholder "Selecione..."
    this.atendimentoForm = this.fb.group({
      dataHora: ['', [Validators.required]],
      descricao: ['', [Validators.required, Validators.minLength(5)]], // Adicionei um minLength
      status: ['AGENDADO', [Validators.required]],
      tipoAtendimentoId: [null, [Validators.required]] // Começa como nulo
    });
  }

  get form() { return this.atendimentoForm; }

  onSubmit(): void {
    if (this.atendimentoForm.invalid || !this.usuarioLogado) {
      this.errorMessage = "Formulário inválido. Verifique todos os campos.";
      // Marca todos os campos como "tocados" para exibir erros
      this.atendimentoForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const payload = {
      ...this.atendimentoForm.value,
      alunoId: this.alunoId,
      responsavelId: this.usuarioLogado.id
    };

    this.atendimentoService.create(payload).subscribe({
      next: () => {
        this.isLoading = false;
        // Reseta o formulário para os valores padrão
        this.atendimentoForm.reset({
          status: 'AGENDADO',
          tipoAtendimentoId: null
        });
        this.atendimentoSalvo.emit();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Erro ao salvar atendimento.";
        this.isLoading = false;
      }
    });
  }
}
