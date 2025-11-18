// src/app/pages/admin/diagnostico-admin/diagnostico-admin.component.ts
import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, switchMap, tap, finalize, combineLatest, startWith, map } from 'rxjs';
import { Diagnostico } from '../../../core/models/aluno.model';
import { DiagnosticoService } from '../../../core/services/api.service';

@Component({
  selector: 'app-diagnostico-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './diagnostico-admin.component.html',
  styleUrls: ['./diagnostico-admin.component.scss']
})
export class DiagnosticoAdminComponent implements OnInit {

  private fb = inject(FormBuilder);
  private diagnosticoService = inject(DiagnosticoService);

  @ViewChild('formCard') private formCard!: ElementRef;

  public diagnosticos$!: Observable<Diagnostico[]>;
  public crudForm: FormGroup;

  public isLoading = false;
  public diagnosticoSearch = new FormControl('');
  public isMobileFormVisible = false;

  protected isEditMode = false;
  protected selectedDiagnosticoId: number | null = null;
  protected errorMessage: string | null = null;

  private refresh$ = new BehaviorSubject<void>(undefined);
  private allDiagnosticos$!: Observable<Diagnostico[]>;

  constructor() {
    this.crudForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]], // Aumentado
      cid: ['', [Validators.maxLength(10)]],
      sigla: ['', [Validators.maxLength(10)]]
    });
  }

  ngOnInit(): void {
     this.allDiagnosticos$ = this.refresh$.pipe(
      switchMap(() => this.diagnosticoService.findAll()),
      tap(list => list.sort((a, b) => a.nome.localeCompare(b.nome)))
    );

    this.diagnosticos$ = combineLatest([
      this.allDiagnosticos$,
      this.diagnosticoSearch.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([diagnosticos, searchTerm]) => {
        const filter = (searchTerm || '').toLowerCase().trim();
        if (!filter) return diagnosticos;
        return diagnosticos.filter(diag =>
          diag.nome.toLowerCase().includes(filter) ||
          (diag.sigla || '').toLowerCase().includes(filter) ||
          (diag.cid || '').toLowerCase().includes(filter)
        );
      })
    );
  }

  protected selectDiagnostico(diagnostico: Diagnostico): void {
    this.isEditMode = true;
    this.selectedDiagnosticoId = diagnostico.id;
    this.crudForm.patchValue({
      nome: diagnostico.nome,
      cid: diagnostico.cid || '',
      sigla: diagnostico.sigla || ''
    });
    this.errorMessage = null;
    this.isMobileFormVisible = true;
    this.scrollToFormOnMobile();
  }

  protected clearForm(): void {
    this.isEditMode = false;
    this.selectedDiagnosticoId = null;
    this.crudForm.reset({
      nome: '', cid: '', sigla: ''
    });
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
    const save$: Observable<Diagnostico> = this.isEditMode
      ? this.diagnosticoService.update(this.selectedDiagnosticoId!, data)
      : this.diagnosticoService.create(data);

    save$.pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.clearForm();
        this.refresh$.next();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao salvar diagnóstico.';
      }
    });
  }

  protected onDelete(): void {
    if (!this.isEditMode || !this.selectedDiagnosticoId || this.isLoading) return;

    if (confirm('Tem certeza que deseja excluir este diagnóstico? Esta ação não pode ser desfeita.')) {
      this.isLoading = true;
      this.errorMessage = null;

      this.diagnosticoService.delete(this.selectedDiagnosticoId).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this.clearForm();
          this.refresh$.next();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erro ao excluir. Este diagnóstico pode estar em uso por um aluno.';
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
