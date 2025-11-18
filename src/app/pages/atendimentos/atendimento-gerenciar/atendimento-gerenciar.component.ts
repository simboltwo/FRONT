/*
 * Arquivo: simboltwo/front/FRONT-6ada510ac5875a89a10169e7efd5d09b58529961/src/app/pages/atendimentos/atendimento-gerenciar/atendimento-gerenciar.component.ts
 * Descrição: Refatorado para usar 'combineLatest' para filtros e 'concluirAtendimento' para o modal.
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, BehaviorSubject, map, switchMap, combineLatest, startWith, debounceTime } from 'rxjs'; // --- MUDANÇA ---
import { Atendimento, AtendimentoConclusao } from '../../../core/models/atendimento.model'; // --- MUDANÇA ---
import { AtendimentoService } from '../../../core/services/atendimento.service';
import * as bootstrap from 'bootstrap';
import { ToastService } from '../../../core/services/toast.service'; // Importar ToastService

@Component({
  selector: 'app-atendimento-gerenciar',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './atendimento-gerenciar.component.html',
  styleUrls: ['./atendimento-gerenciar.component.scss']
})
export class AtendimentoGerenciarComponent implements OnInit {

  private atendimentoService = inject(AtendimentoService);
  private fb = inject(FormBuilder);
  protected router = inject(Router);
  private toastService = inject(ToastService); // --- MUDANÇA ---

  protected atendimentosAgendados$!: Observable<Atendimento[]>;
  protected atendimentosHistorico$!: Observable<Atendimento[]>;

  protected updateForm!: FormGroup;
  protected filterForm!: FormGroup; // --- MUDANÇA ---

  protected selectedAtendimento: Atendimento | null = null;
  protected isLoading = false;
  protected errorMessage: string | null = null;

  private refresh$ = new BehaviorSubject<void>(undefined);
  private modalInstance: bootstrap.Modal | null = null;

  constructor() {
    this.updateForm = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(5)]],
      status: ['REALIZADO', [Validators.required]]
    });

    // --- MUDANÇA ---
    this.filterForm = this.fb.group({
      alunoNome: ['']
    });
  }

  ngOnInit(): void {
    // --- INÍCIO DA MUDANÇA (Filtro) ---
    const filters$ = this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      debounceTime(300) // Evita chamadas de API a cada tecla digitada
    );

    const allAtendimentos$ = combineLatest([filters$, this.refresh$]).pipe(
      switchMap(([filters, _]) =>
        this.atendimentoService.findMyAtendimentos(filters.alunoNome || null)
      )
    );
    // --- FIM DA MUDANÇA ---

    this.atendimentosAgendados$ = allAtendimentos$.pipe(
      map(atendimentos => atendimentos.filter(a => a.status === 'AGENDADO'))
    );

    this.atendimentosHistorico$ = allAtendimentos$.pipe(
      map(atendimentos => atendimentos.filter(a => a.status !== 'AGENDADO'))
    );
  }

  protected openUpdateModal(atendimento: Atendimento): void {
    this.selectedAtendimento = atendimento;
    this.errorMessage = null;

    this.updateForm.patchValue({
      descricao: atendimento.descricao || '',
      status: 'REALIZADO'
    });

    const modalElement = document.getElementById('modalConductAtendimento');
    if (modalElement) {
      this.modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
      this.modalInstance.show();
    }
  }

  protected onSubmitUpdate(): void {
    if (this.updateForm.invalid || !this.selectedAtendimento) {
      this.errorMessage = "Formulário inválido. A descrição é obrigatória.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // --- INÍCIO DA MUDANÇA (Modal) ---
    // Usamos o DTO leve de Conclusão
    const payload: AtendimentoConclusao = {
      descricao: this.updateForm.value.descricao,
      status: this.updateForm.value.status
    };

    // Usamos o novo método do serviço
    this.atendimentoService.concluirAtendimento(this.selectedAtendimento.id, payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh$.next(); // Recarrega as listas
        if (this.modalInstance) {
          this.modalInstance.hide();
        }
        this.toastService.show('Atendimento salvo com sucesso!', 'success'); // Feedback
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || "Erro ao atualizar atendimento.";
        // Não usamos o toast aqui, pois o erro é exibido dentro do modal
      }
    });
    // --- FIM DA MUDANÇA ---
  }

  protected getStatusClass(status: string): string {
    switch (status) {
      case 'REALIZADO': return 'bg-success text-white';
      case 'CANCELADO': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }
}
