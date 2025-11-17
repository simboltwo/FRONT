import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';
import { Laudo } from '../../../core/models/laudo.model';
import { LaudoService } from '../../../core/services/laudo.service';

@Component({
  selector: 'app-laudo-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './laudo-list.component.html'
})
export class LaudoList implements OnChanges {
  @Input() alunoId!: number;

  protected laudos$!: Observable<Laudo[]>;
  private laudoService = inject(LaudoService);
  private alunoId$ = new BehaviorSubject<number | null>(null);

  constructor() {
    this.laudos$ = this.alunoId$.pipe(
      switchMap(id => {
        if (id) {
          return this.laudoService.findByAlunoId(id);
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

  protected deleteLaudo(laudoId: number): void {
    if (confirm('Tem certeza de que deseja excluir este laudo? Esta ação não pode ser desfeita.')) {
      this.laudoService.delete(laudoId).subscribe({
        next: () => {
          this.refresh();
        },
        error: (err) => {
          alert('Erro ao excluir laudo: ' + err.error?.message);
        }
      });
    }
  }
}
