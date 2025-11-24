import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';
import { HistoricoAcademico } from '../../../core/models/historico-academico.model';
import { HistoricoAcademicoService } from '../../../core/services/historico-academico.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-historico-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="historico$ | async as list; else loading">
      <div *ngIf="list.length > 0; else noData" class="list-group list-group-flush">
        <div *ngFor="let item of list" class="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-1">
              <i class="bi bi-calendar-check me-2 text-primary"></i>
              {{ item.curso.nome }}
              <span *ngIf="item.turma">({{ item.turma.nome }})</span>
            </h6>
            <small class="text-muted">
              De: {{ item.dataInicio | date: 'MM/yyyy' }}
              - Até: {{ item.dataFim | date: 'MM/yyyy' }}
              <span *ngIf="!item.dataFim">(Atual)</span>
            </small>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-secondary me-2" (click)="editHistorico(item)">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" (click)="deleteHistorico(item.id)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
      <ng-template #noData>
        <p class="text-muted text-center p-3">Nenhum registro de histórico acadêmico.</p>
      </ng-template>
    </div>
    <ng-template #loading>
      <p class="text-muted text-center p-3">Carregando histórico...</p>
    </ng-template>
  `
})
export class HistoricoListComponent implements OnChanges {
  @Input() alunoId!: number;

  protected historico$!: Observable<HistoricoAcademico[]>;
  private historicoService = inject(HistoricoAcademicoService);
  private toastService = inject(ToastService);
  private alunoId$ = new BehaviorSubject<number | null>(null);

  constructor() {
    this.historico$ = this.alunoId$.pipe(
      switchMap(id => {
        if (id) {
          return this.historicoService.findByAlunoId(id);
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

  protected editHistorico(item: HistoricoAcademico): void {
      this.toastService.show('Funcionalidade de edição em desenvolvimento. Use o modal para Adicionar ou Excluir.', 'warning', 3000);
      // Aqui, você abriria o modalHistorico (edit mode)
  }

  protected deleteHistorico(historicoId: number): void {
    if (confirm('Tem certeza que deseja excluir este registro de histórico?')) {
      this.historicoService.delete(historicoId).subscribe({
        next: () => {
          this.refresh();
          this.toastService.show('Registro excluído com sucesso!', 'success');
        },
        error: (err) => {
          this.toastService.show(err.error?.message || 'Erro ao excluir o registro.', 'danger');
        }
      });
    }
  }
}
