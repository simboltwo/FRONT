/*
 * Arquivo: simboltwo/front/FRONT-6ada510ac5875a89a10169e7efd5d09b58529961/src/app/pages/atendimentos/atendimento-list/atendimento-list.component.ts
 * Descrição: Adicionado @Input() 'status' e 'title', e modificado o serviço para usar o filtro.
 */
// src/app/pages/atendimentos/atendimento-list/atendimento-list.component.ts
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AtendimentoService } from '../../../core/services/atendimento.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Atendimento } from '../../../core/models/atendimento.model';

@Component({
  selector: 'app-atendimento-list',
  standalone: true,
  imports: [CommonModule],
  // --- MUDANÇA NO TEMPLATE ---
  template: `
    <h5 class="mt-4">{{ title }}</h5>
    <div *ngIf="atendimentos$ | async as atendimentos; else loading">
      <div *ngIf="atendimentos.length > 0; else noAtendimentos" class="list-group">
        <div *ngFor="let item of atendimentos" class="list-group-item">
          <div class="d-flex justify-content-between">
            <h6 class="mb-1">{{ item.tipoAtendimentoNome }}</h6>

            <span class="badge" [ngClass]="getStatusClass(item.status)">
              {{ item.status }}
            </span>
          </div>
          <p class="mb-1">{{ item.descricao || 'Nenhuma descrição informada.' }}</p>
          <small class="text-muted">
            Em: {{ item.dataHora | date: 'dd/MM/yyyy HH:mm' }}
            - Por: {{ item.responsavelNome }}
          </small>
        </div>
      </div>
      <ng-template #noAtendimentos>
        <p class="text-muted">Nenhum atendimento encontrado para esta visualização.</p>
      </ng-template>
    </div>
    <ng-template #loading><p>Carregando...</p></ng-template>
  `
})
export class AtendimentoList implements OnChanges {
  @Input() alunoId!: number;
  // --- NOVOS INPUTS ---
  @Input() status: string | null = null;
  @Input() title: string = 'Histórico de Atendimentos';
  // --- FIM DOS NOVOS INPUTS ---

  protected atendimentos$!: Observable<Atendimento[]>;
  private atendimentoService = inject(AtendimentoService);

  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor() {
    this.atendimentos$ = this.refreshTrigger$.pipe(
      switchMap(() => {
        if (this.alunoId) {
          // --- MUDANÇA: Passa o status para o serviço ---
          return this.atendimentoService.findByAlunoId(this.alunoId, this.status);
        }
        return [];
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Se o ID do aluno ou o status mudarem, recarrega a lista
    if (changes['alunoId'] || changes['status']) {
      this.refresh();
    }
  }

  public refresh(): void {
    // Re-emite o ID atual para forçar o switchMap a recarregar
    this.refreshTrigger$.next();
  }

  protected getStatusClass(status: string): string {
    switch (status) {
      case 'REALIZADO': return 'bg-success text-white';
      case 'CANCELADO': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }
}
