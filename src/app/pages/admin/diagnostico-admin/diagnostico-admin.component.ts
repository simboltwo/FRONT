// src/app/pages/admin/diagnostico-admin/diagnostico-admin.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, switchMap, tap } from 'rxjs';
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

  protected diagnosticos$!: Observable<Diagnostico[]>;
  protected crudForm: FormGroup;

  protected isEditMode = false;
  protected selectedDiagnosticoId: number | null = null;
  protected errorMessage: string | null = null;

  private refresh$ = new BehaviorSubject<void>(undefined);

  constructor() {
    this.crudForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(45)]],
      cid: ['', [Validators.maxLength(10)]],
      sigla: ['', [Validators.maxLength(10)]]
    });
  }

  ngOnInit(): void {
    this.diagnosticos$ = this.refresh$.pipe(
      switchMap(() => this.diagnosticoService.findAll()),
      tap(list => list.sort((a, b) => a.nome.localeCompare(b.nome)))
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
  }

  protected clearForm(): void {
    this.isEditMode = false;
    this.selectedDiagnosticoId = null;
    this.crudForm.reset({
      nome: '', cid: '', sigla: ''
    });
    this.errorMessage = null;
  }

  protected onSubmit(): void {
    if (this.crudForm.invalid) {
      this.errorMessage = "Formulário inválido. Verifique os campos.";
      return;
    }
    this.errorMessage = null;

    const data = this.crudForm.value;
    const save$: Observable<Diagnostico> = this.isEditMode
      ? this.diagnosticoService.update(this.selectedDiagnosticoId!, data)
      : this.diagnosticoService.create(data);

    save$.subscribe({
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
    if (!this.isEditMode || !this.selectedDiagnosticoId) {
      return;
    }

    if (confirm('Tem certeza que deseja excluir este diagnóstico? Esta ação não pode ser desfeita.')) {
      this.diagnosticoService.delete(this.selectedDiagnosticoId).subscribe({
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
}
