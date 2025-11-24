import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Curso, Turma } from '../../../core/models/aluno.model';
import { CursoService, TurmaService } from '../../../core/services/api.service';
import { HistoricoAcademicoService } from '../../../core/services/historico-academico.service';
import { HistoricoAcademicoInsert } from '../../../core/models/historico-academico.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-historico-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Novo Registro Acadêmico</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

          <div class="row g-3">
            <div class="col-md-6 mb-3">
              <label for="cursoId" class="form-label">Curso *</label>
              <select id="cursoId" class="form-select" formControlName="cursoId"
                      [class.is-invalid]="form.get('cursoId')!.invalid && form.get('cursoId')!.touched">
                <option [ngValue]="null" disabled>Selecione o Curso...</option>
                <ng-container *ngIf="cursos$ | async as cursos">
                  <option *ngFor="let curso of cursos" [ngValue]="curso.id">{{ curso.nome }}</option>
                </ng-container>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label for="turmaId" class="form-label">Turma (Opcional)</label>
              <select id="turmaId" class="form-select" formControlName="turmaId">
                <option [ngValue]="null">Selecione a Turma...</option>
                <ng-container *ngIf="turmas$ | async as turmas">
                  <option *ngFor="let turma of turmas" [ngValue]="turma.id">{{ turma.nome }}</option>
                </ng-container>
              </select>
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-6 mb-3">
              <label for="dataInicio" class="form-label">Data de Início *</label>
              <input type="date" class="form-control" id="dataInicio" formControlName="dataInicio"
                     [class.is-invalid]="form.get('dataInicio')!.invalid && form.get('dataInicio')!.touched">
            </div>
            <div class="col-md-6 mb-3">
              <label for="dataFim" class="form-label">Data de Fim (Deixe vazio para 'Atual')</label>
              <input type="date" class="form-control" id="dataFim" formControlName="dataFim">
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" [disabled]="isLoading">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isLoading">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isLoading ? 'Salvando...' : 'Salvar Registro' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class HistoricoFormComponent implements OnInit {
  @Input() alunoId!: number;
  @Output() historicoSalvo = new EventEmitter<void>();

  // --- MUDANÇA: Propriedade interna usa underscore para evitar conflito. ---
  private _form!: FormGroup;
  protected cursos$!: Observable<Curso[]>;
  protected turmas$!: Observable<Turma[]>;
  protected isLoading = false;
  protected errorMessage: string | null = null;

  private fb = inject(FormBuilder);
  private cursoService = inject(CursoService);
  private turmaService = inject(TurmaService);
  private historicoService = inject(HistoricoAcademicoService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.cursos$ = this.cursoService.findAll();
    this.turmas$ = this.turmaService.findAll();

    // Inicializa o novo nome da propriedade
    this._form = this.fb.group({
      cursoId: [null, [Validators.required]],
      turmaId: [null],
      dataInicio: ['', [Validators.required]],
      dataFim: ['']
    });
  }

  // --- MUDANÇA: Getter público para acesso no template. ---
  get form(): FormGroup { return this._form; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage = "Por favor, preencha todos os campos obrigatórios.";
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const payload: HistoricoAcademicoInsert = {
      ...this.form.value,
      alunoId: this.alunoId
    };

    // Limpeza de Dados: Garante que campo opcional vazio é removido do payload.
    if (payload.dataFim === '') {
        delete payload.dataFim;
    }
    if (payload.turmaId === null) {
        delete payload.turmaId;
    }

    this.historicoService.create(payload).subscribe({
      next: () => {
        this.isLoading = false;
        // Limpa o formulário
        this.form.reset({
          cursoId: null,
          turmaId: null,
          dataInicio: '',
          dataFim: ''
        });
        this.toastService.show('Registro acadêmico salvo com sucesso!', 'success');
        this.historicoSalvo.emit();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao salvar o registro. Verifique a validade das datas.';
        this.isLoading = false;
      }
    });
  }
}
