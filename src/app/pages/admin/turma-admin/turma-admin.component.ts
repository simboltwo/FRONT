// src/app/pages/admin/turma-admin/turma-admin.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, switchMap, tap } from 'rxjs';
import { Turma } from '../../../core/models/aluno.model';
import { TurmaService } from '../../../core/services/api.service';

@Component({
  selector: 'app-turma-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './turma-admin.component.html',
  styleUrls: ['./turma-admin.component.scss']
})
export class TurmaAdminComponent implements OnInit {

  private fb = inject(FormBuilder);
  private turmaService = inject(TurmaService);

  protected turmas$!: Observable<Turma[]>;
  protected crudForm: FormGroup;

  protected isEditMode = false;
  protected selectedTurmaId: number | null = null;
  protected errorMessage: string | null = null;

  // Para forçar o recarregamento da lista
  private refresh$ = new BehaviorSubject<void>(undefined);

  constructor() {
    this.crudForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]]
    });
  }

  ngOnInit(): void {
    this.turmas$ = this.refresh$.pipe(
      switchMap(() => this.turmaService.findAll()),
      // Ordena a lista por nome
      tap(list => list.sort((a, b) => a.nome.localeCompare(b.nome)))
    );
  }

  /** Seleciona um item da lista para edição */
  protected selectTurma(turma: Turma): void {
    this.isEditMode = true;
    this.selectedTurmaId = turma.id;
    this.crudForm.patchValue({
      nome: turma.nome
    });
    this.errorMessage = null;
  }

  /** Limpa o formulário para criar um novo item */
  protected clearForm(): void {
    this.isEditMode = false;
    this.selectedTurmaId = null;
    this.crudForm.reset({ nome: '' });
    this.errorMessage = null;
  }

  /** Trata a submissão do formulário (Criar ou Atualizar) */
  protected onSubmit(): void {
    if (this.crudForm.invalid) {
      this.errorMessage = "Formulário inválido. Verifique os campos.";
      return;
    }
    this.errorMessage = null;

    const data = this.crudForm.value;
    const save$: Observable<Turma> = this.isEditMode
      ? this.turmaService.update(this.selectedTurmaId!, data)
      : this.turmaService.create(data);

    save$.subscribe({
      next: () => {
        this.clearForm();
        this.refresh$.next(); // Força o recarregamento da lista
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao salvar turma.';
      }
    });
  }

  /** Trata a exclusão do item selecionado */
  protected onDelete(): void {
    if (!this.isEditMode || !this.selectedTurmaId) {
      return;
    }

    if (confirm('Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.')) {
      this.turmaService.delete(this.selectedTurmaId).subscribe({
        next: () => {
          this.clearForm();
          this.refresh$.next(); // Força o recarregamento da lista
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erro ao excluir. Esta turma pode estar em uso por um aluno.';
        }
      });
    }
  }
}
