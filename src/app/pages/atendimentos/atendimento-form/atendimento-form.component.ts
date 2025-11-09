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
  template: `
    <form [formGroup]="atendimentoForm" (ngSubmit)="onSubmit()">
      <h5 class="mb-3">Registrar Novo Atendimento</h5>
      <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="dataHora" class="form-label">Data e Hora</label>
          <input type="datetime-local" class="form-control" id="dataHora" formControlName="dataHora"
                [class.is-invalid]="form.get('dataHora')!.invalid && form.get('dataHora')!.touched">
          <div *ngIf="form.get('dataHora')!.invalid && form.get('dataHora')!.touched" class="invalid-feedback">
            Data e hora são obrigatórios.
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <label for="tipoAtendimentoId" class="form-label">Tipo de Atendimento</label>
          <select id="tipoAtendimentoId" class="form-select" formControlName="tipoAtendimentoId"
                  [class.is-invalid]="form.get('tipoAtendimentoId')!.invalid && form.get('tipoAtendimentoId')!.touched">
            <option [ngValue]="null" disabled>Selecione...</option>
            <option *ngFor="let tipo of (tiposAtendimento$ | async)" [ngValue]="tipo.id">
              {{ tipo.nome }}
            </option>
          </select>
          <div *ngIf="form.get('tipoAtendimentoId')!.invalid && form.get('tipoAtendimentoId')!.touched" class="invalid-feedback">
            O tipo é obrigatório.
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label for="status" class="form-label">Status</label>
        <select id="status" class="form-select" formControlName="status">
          <option value="AGENDADO">Agendado</option>
          <option value="REALIZADO">Realizado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      <div class="mb-3">
        <label for="descricao" class="form-label">Descrição / Observações</label>
        <textarea class="form-control" id="descricao" rows="4" formControlName="descricao"
                  [class.is-invalid]="form.get('descricao')!.invalid && form.get('descricao')!.touched"></textarea>
        <div *ngIf="form.get('descricao')!.invalid && form.get('descricao')!.touched" class="invalid-feedback">
          Descrição é obrigatória.
        </div>
      </div>

      <div class="text-end">
        <button type="submit" class="btn btn-success" [disabled]="atendimentoForm.invalid || isLoading">
          {{ isLoading ? 'Salvando...' : 'Salvar Atendimento' }}
        </button>
      </div>
    </form>
  `
})
export class AtendimentoForm implements OnInit {
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
  private usuarioService = inject(UsuarioService); // Para buscar o 'responsavelId'

  ngOnInit(): void {
    if (!this.alunoId) {
      this.errorMessage = "Erro: ID do Aluno não fornecido.";
      return;
    }

    // Busca o usuário logado (o responsável)
    this.usuarioService.getMe().subscribe(user => {
      this.usuarioLogado = user;
    });

    // Carrega os tipos de atendimento para o dropdown
    this.tiposAtendimento$ = this.tipoAtendimentoService.findAll();

    // Inicializa o formulário
    this.atendimentoForm = this.fb.group({
      dataHora: ['', [Validators.required]],
      descricao: ['', [Validators.required]],
      status: ['AGENDADO', [Validators.required]],
      tipoAtendimentoId: [null, [Validators.required]]
    });
  }

  get form() { return this.atendimentoForm; }

  onSubmit(): void {
    if (this.atendimentoForm.invalid || !this.usuarioLogado) {
      this.errorMessage = "Formulário inválido ou usuário não carregado.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const payload = {
      ...this.atendimentoForm.value,
      alunoId: this.alunoId,
      responsavelId: this.usuarioLogado.id // Pega o ID do usuário logado
    };

    this.atendimentoService.create(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.atendimentoForm.reset({ status: 'AGENDADO' }); // Limpa o form
        this.atendimentoSalvo.emit(); // Avisa o componente pai (aluno-detalhe)
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Erro ao salvar atendimento.";
        this.isLoading = false;
      }
    });
  }
}
