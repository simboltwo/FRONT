// src/app/pages/peis/pei-list/pei-list.component.ts
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';
import { PEI } from '../../../core/models/pei.model';
import { PeiService } from '../../../core/services/pei.service';

@Component({
  selector: 'app-pei-list',
  standalone: true,
  imports: [CommonModule],
  // O template inline foi atualizado para exibir a lista
  template: `
    <div *ngIf="peis$ | async as peis; else loading">
      <div *ngIf="peis.length > 0; else noData" class="list-group list-group-flush">

        <div *ngFor="let item of peis" class="list-group-item px-0 py-3">
          <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">
              <i class="bi bi-clipboard2-data me-2"></i>
              Plano de {{ item.dataInicio | date: 'MM/yyyy' }}
            </h6>
          </div>
          <div class="pei-details">
            <strong>Metas:</strong>
            <p class="text-muted">{{ item.metas }}</p>
            <strong>Estratégias:</strong>
            <p class="text-muted">{{ item.estrategias }}</p>
          </div>
          <small class="text-muted">
            Responsável: {{ item.responsavelNome }}
          </small>
        </div>

      </div>
      <ng-template #noData>
        <p class="text-muted text-center p-3">Nenhum PEI registrado para este aluno.</p>
      </ng-template>
    </div>
    <ng-template #loading>
      <p class="text-muted text-center p-3">Carregando PEIs...</p>
    </ng-template>
  `
})
export class PeiList implements OnChanges {
  @Input() alunoId!: number;

  protected peis$!: Observable<PEI[]>;
  private peiService = inject(PeiService);

  private alunoId$ = new BehaviorSubject<number | null>(null);

  constructor() {
    this.peis$ = this.alunoId$.pipe(
      switchMap(id => {
        if (id) {
          return this.peiService.findByAlunoId(id);
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

  public refresh(): void {
    this.alunoId$.next(this.alunoId);
  }
}
