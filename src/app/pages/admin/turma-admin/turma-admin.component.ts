// src/app/pages/admin/turma-admin/turma-admin.component.ts
import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, switchMap, tap, finalize, combineLatest, startWith, map } from 'rxjs';
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

  @ViewChild('formCard') private formCard!: ElementRef;

  public turmas$!: Observable<Turma[]>;
  public crudForm: FormGroup;

  public isLoading = false;
  public turmaSearch = new FormControl('');
  public isMobileFormVisible = false;

  protected isEditMode = false;
  protected selectedTurmaId: number | null = null;
  protected errorMessage: string | null = null;

  private refresh$ = new BehaviorSubject<void>(undefined);
  private allTurmas$!: Observable<Turma[]>;

  constructor() {
    this.crudForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]]
    });
  }

  ngOnInit(): void {
    this.allTurmas$ = this.refresh$.pipe(
      switchMap(() => this.turmaService.findAll()),
      tap(list => list.sort((a, b) => a.nome.localeCompare(b.nome)))
    );

    this.turmas$ = combineLatest([
      this.allTurmas$,
      this.turmaSearch.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([turmas, searchTerm]) => {
        const filter = (searchTerm || '').toLowerCase().trim();
        if (!filter) return turmas;
        return turmas.filter(turma =>
          turma.nome.toLowerCase().includes(filter)
        );
      })
    );
  }

  protected selectTurma(turma: Turma): void {
    this.isEditMode = true;
    this.selectedTurmaId = turma.id;
    this.crudForm.patchValue({
      nome: turma.nome
    });
    this.errorMessage = null;
    this.isMobileFormVisible = true;
    this.scrollToFormOnMobile();
  }

  protected clearForm(): void {
    this.isEditMode = false;
    this.selectedTurmaId = null;
    this.crudForm.reset({ nome: '' });
    this.errorMessage = null;
    this.isMobileFormVisible = false;
  }

  protected onNewClick(): void {
    this.clearForm();
    this.isMobileFormVisible = true;
    setTimeout(() => this.scrollToFormOnMobile(), 0);
  }

  protected onSubmit(): void {
    if (this.crudForm.invalid || this.isLoading) return;

    this.errorMessage = null;
    this.isLoading = true;

    const data = this.crudForm.value;
    const save$: Observable<Turma> = this.isEditMode
      ? this.turmaService.update(this.selectedTurmaId!, data)
      : this.turmaService.create(data);

    save$.pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.clearForm();
        this.refresh$.next();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao salvar turma.';
      }
    });
  }

  protected onDelete(): void {
    if (!this.isEditMode || !this.selectedTurmaId || this.isLoading) return;

    if (confirm('Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.')) {
      this.isLoading = true;
      this.errorMessage = null;

      this.turmaService.delete(this.selectedTurmaId).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this.clearForm();
          this.refresh$.next();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erro ao excluir. Esta turma pode estar em uso por um aluno.';
        }
      });
    }
  }

  private scrollToFormOnMobile(): void {
    if (window.innerWidth < 992 && this.formCard) {
      this.formCard.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}
