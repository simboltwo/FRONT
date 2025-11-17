// src/app/pages/admin/tipo-atendimento-admin/tipo-atendimento-admin.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, switchMap, tap } from 'rxjs';
import { TipoAtendimento } from '../../../core/models/aluno.model';
import { TipoAtendimentoService } from '../../../core/services/api.service';

@Component({
  selector: 'app-tipo-atendimento-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tipo-atendimento-admin.component.html',
  styleUrls: ['./tipo-atendimento-admin.component.scss']
})
export class TipoAtendimentoAdminComponent implements OnInit {

  private fb = inject(FormBuilder);
  private tipoAtendimentoService = inject(TipoAtendimentoService);

  protected tiposAtendimento$!: Observable<TipoAtendimento[]>;
  protected crudForm: FormGroup;

  protected isEditMode = false;
  protected selectedId: number | null = null;
  protected errorMessage: string | null = null;

  // Para forçar o recarregamento da lista
  private refresh$ = new BehaviorSubject<void>(undefined);

  constructor() {
    this.crudForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]]
    });
  }

  ngOnInit(): void {
    this.tiposAtendimento$ = this.refresh$.pipe(
      switchMap(() => this.tipoAtendimentoService.findAll()),
      // Ordena a lista por nome
      tap(list => list.sort((a, b) => a.nome.localeCompare(b.nome)))
    );
  }

  /** Seleciona um item da lista para edição */
  protected selectItem(item: TipoAtendimento): void {
    this.isEditMode = true;
    this.selectedId = item.id;
    this.crudForm.patchValue({
      nome: item.nome
    });
    this.errorMessage = null;
  }

  /** Limpa o formulário para criar um novo item */
  protected clearForm(): void {
    this.isEditMode = false;
    this.selectedId = null;
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
    const save$: Observable<TipoAtendimento> = this.isEditMode
      ? this.tipoAtendimentoService.update(this.selectedId!, data)
      : this.tipoAtendimentoService.create(data);

    save$.subscribe({
      next: () => {
        this.clearForm();
        this.refresh$.next(); // Força o recarregamento da lista
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao salvar o tipo de atendimento.';
      }
    });
  }

  /** Trata a exclusão do item selecionado */
  protected onDelete(): void {
    if (!this.isEditMode || !this.selectedId) {
      return;
    }

    if (confirm('Tem certeza que deseja excluir este tipo de atendimento? Esta ação não pode ser desfeita.')) {
      this.tipoAtendimentoService.delete(this.selectedId).subscribe({
        next: () => {
          this.clearForm();
          this.refresh$.next(); // Força o recarregamento da lista
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erro ao excluir. Este item pode estar em uso por um atendimento.';
        }
      });
    }
  }
}
