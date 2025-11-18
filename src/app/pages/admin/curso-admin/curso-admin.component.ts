// src/app/pages/admin/curso-admin/curso-admin.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// MUDANÇA: Importar FormControl
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
// MUDANÇA: Importar combineLatest, startWith, map
import { Observable, BehaviorSubject, switchMap, tap, finalize, combineLatest, startWith, map } from 'rxjs';
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

  public cursos$!: Observable<Curso[]>;
  public crudForm: FormGroup;

  public isLoading = false;

  // MUDANÇA: Novo FormControl para o filtro
  public cursoSearch = new FormControl('');

  // MUDANÇA: Nova variável para controlar a visualização no mobile
  public isMobileFormVisible = false;

  protected isEditMode = false;
  protected selectedCursoId: number | null = null;
  protected errorMessage: string | null = null;

  private refresh$ = new BehaviorSubject<void>(undefined);
  private allCursos$!: Observable<Curso[]>; // Armazena a lista original

  constructor() {
    this.crudForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]]
    });
  }

  ngOnInit(): void {
    // 1. Busca todos os cursos e armazena
    this.allCursos$ = this.refresh$.pipe(
      switchMap(() => this.cursoService.findAll()),
      tap(list => list.sort((a, b) => a.nome.localeCompare(b.nome)))
    );

    // 2. MUDANÇA: Cria um observable filtrado que reage à busca
    this.cursos$ = combineLatest([
      this.allCursos$,
      this.cursoSearch.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([cursos, searchTerm]) => {
        const filter = (searchTerm || '').toLowerCase().trim();
        if (!filter) {
          return cursos; // Retorna todos se a busca estiver vazia
        }
        return cursos.filter(curso =>
          curso.nome.toLowerCase().includes(filter)
        );
      })
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

    // MUDANÇA: Ativa a visualização do formulário no mobile
    this.isMobileFormVisible = true;
  }

  /** Limpa o formulário para criar um novo item */
  protected clearForm(): void {
    this.isEditMode = false;
    this.selectedCursoId = null;
    this.crudForm.reset({ nome: '' });
    this.errorMessage = null;

    // MUDANÇA: Esconde o formulário e volta para a lista no mobile
    this.isMobileFormVisible = false;
  }

  /** Ação do botão Novo */
  protected onNewClick(): void {
    this.clearForm();
    // MUDANÇA: Força a exibição do formulário no mobile
    this.isMobileFormVisible = true;
  }

  /** Trata a submissão do formulário (Criar ou Atualizar) */
  protected onSubmit(): void {
    if (this.crudForm.invalid || this.isLoading) {
      return;
    }
    this.errorMessage = null;
    this.isLoading = true;

    const data = this.crudForm.value;
    const save$: Observable<Curso> = this.isEditMode
      ? this.cursoService.update(this.selectedCursoId!, data)
      : this.cursoService.create(data);

    save$.pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.clearForm(); // Isso já esconde o form no mobile
        this.refresh$.next();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao salvar curso.';
      }
    });
  }

  /** Trata a exclusão do item selecionado */
  protected onDelete(): void {
    if (!this.isEditMode || !this.selectedCursoId || this.isLoading) {
      return;
    }

    if (confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
      this.isLoading = true;
      this.errorMessage = null;

      this.cursoService.delete(this.selectedCursoId).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this.clearForm(); // Isso já esconde o form no mobile
          this.refresh$.next();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erro ao excluir. Este curso pode estar em uso por um aluno.';
        }
      });
    }
  }
}
