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
  // --- MUDANÇA: APONTA PARA ARQUIVOS SEPARADOS ---
  templateUrl: './historico-form.component.html',
  styleUrls: ['./historico-form.component.scss']
  // --- FIM MUDANÇA ---
})
export class HistoricoFormComponent implements OnInit {
  @Input() alunoId!: number;
  @Output() historicoSalvo = new EventEmitter<void>();

  // Usamos underscore para evitar o erro Duplicate Identifier 'form'
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

    this._form = this.fb.group({
      cursoId: [null, [Validators.required]],
      turmaId: [null],
      dataInicio: ['', [Validators.required]],
      dataFim: ['']
    });
  }

  // Getter para acesso no template
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

    // Limpeza de Dados: Garante que campos opcionais vazios são removidos do payload para a API
    if (payload.dataFim === '') {
        delete payload.dataFim;
    }
    if (payload.turmaId === null) {
        delete payload.turmaId;
    }

    this.historicoService.create(payload).subscribe({
      next: () => {
        this.isLoading = false;
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
