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
  template: `
    <h5 class="mt-4">Histórico de Atendimentos</h5>
    <div *ngIf="atendimentos$ | async as atendimentos; else loading">
      <div *ngIf="atendimentos.length > 0; else noAtendimentos" class="list-group">
        <div *ngFor="let item of atendimentos" class="list-group-item">
          <div class="d-flex justify-content-between">
            <h6 class="mb-1">{{ item.tipoAtendimentoNome }}</h6>
            <span class_="badge" [ngClass]="getStatusClass(item.status)">
              {{ item.status }}
            </span>
          </div>
          <p class="mb-1">{{ item.descricao }}</p>
          <small class="text-muted">
            Em: {{ item.dataHora | date: 'dd/MM/yyyy HH:mm' }}
            - Por: {{ item.responsavelNome }}
          </small>
        </div>
      </div>
      <ng-template #noAtendimentos>
        <p class="text-muted">Nenhum atendimento registrado para este aluno.</p>
      </ng-template>
    </div>
    <ng-template #loading><p>Carregando histórico...</p></ng-template>
  `
})
export class AtendimentoList implements OnChanges {
  @Input() alunoId!: number;

  protected atendimentos$!: Observable<Atendimento[]>;
  private atendimentoService = inject(AtendimentoService);

  // BehaviorSubject para recarregar a lista quando o ID mudar
  private alunoId$ = new BehaviorSubject<number | null>(null);

  constructor() {
    this.atendimentos$ = this.alunoId$.pipe(
      switchMap(id => {
        if (id) {
          // Chama a API
          return this.atendimentoService.findByAlunoId(id);
        }
        return [];
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['alunoId'] && this.alunoId) {
      this.alunoId$.next(this.alunoId);
    }
  }

  protected getStatusClass(status: string): string {
    switch (status) {
      case 'REALIZADO': return 'bg-success text-white';
      case 'CANCELADO': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }
}
