// src/app/pages/admin/curso-admin/curso-admin.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, switchMap, tap } from 'rxjs';
import { Curso } from '../../../core/models/aluno.model';
import { CursoService } from '../../../core/services/api.service';

@Component({
  selector: 'app-curso-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './curso-admin.component.html',
  styleUrls: ['./curso-admin.component.scss']
})
export class CursoAdminComponent implements OnInit {

  private fb = inject(FormBuilder);
  private cursoService = inject(CursoService);

  protected cursos$!: Observable<Curso[]>;
  protected crudForm: FormGroup;

  protected isEditMode = false;
  protected selectedCursoId: number | null = null;
  protected errorMessage: string | null = null;

  // Para forçar o recarregamento da lista
  private refresh$ = new BehaviorSubject<void>(undefined);

  constructor() {
    this.crudForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]]
    });
  }

  ngOnInit(): void {
    this.cursos$ = this.refresh$.pipe(
      switchMap(() => this.cursoService.findAll()),
      // Ordena a lista por nome
      tap(list => list.sort((a, b) => a.nome.localeCompare(b.nome)))
    );
  }

  /** Seleciona um item da lista para edição */
  protected selectCurso(curso: Curso): void {
    this.isEditMode = true;
    this.selectedCursoId = curso.id;
    this.crudForm.patchValue({
      nome: curso.nome
    });
    this.errorMessage = null;
  }

  /** Limpa o formulário para criar um novo item */
  protected clearForm(): void {
    this.isEditMode = false;
    this.selectedCursoId = null;
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
    const save$: Observable<Curso> = this.isEditMode
      ? this.cursoService.update(this.selectedCursoId!, data)
      : this.cursoService.create(data);

    save$.subscribe({
      next: () => {
        this.clearForm();
        this.refresh$.next(); // Força o recarregamento da lista
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao salvar curso.';
      }
    });
  }

  /** Trata a exclusão do item selecionado */
  protected onDelete(): void {
    if (!this.isEditMode || !this.selectedCursoId) {
      return;
    }

    if (confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
      this.cursoService.delete(this.selectedCursoId).subscribe({
        next: () => {
          this.clearForm();
          this.refresh$.next(); // Força o recarregamento da lista
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erro ao excluir. Este curso pode estar em uso por um aluno.';
        }
      });
    }
  }
}
