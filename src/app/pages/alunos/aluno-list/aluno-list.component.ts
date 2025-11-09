import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Aluno } from '../../../core/models/aluno.model';
import { AlunoService } from '../../../core/services/aluno.service';

@Component({
  selector: 'app-aluno-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2><i class="bi bi-people-fill"></i> Alunos Cadastrados</h2>
        <a [routerLink]="['/alunos/novo']" class="btn btn-primary">
          <i class="bi bi-plus-lg"></i> Novo Aluno
        </a>
      </div>

      <div *ngIf="alunos$ | async as alunos; else loading" class="list-group">
        <a *ngFor="let aluno of alunos"
           [routerLink]="['/alunos/detalhe', aluno.id]"
           class="list-group-item list-group-item-action">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ aluno.nome }} <small class="text-muted">({{ aluno.nomeSocial || '...' }})</small></h5>
            <small *ngIf="aluno.prioridadeAtendimento" class="text-danger">
              <i class="bi bi-exclamation-triangle-fill"></i> Prioritário
            </small>
          </div>
          <p class="mb-1">Matrícula: {{ aluno.matricula }} | Curso: {{ aluno.curso.nome }}</p>
        </a>
      </div>
      <ng-template #loading><p>Carregando alunos...</p></ng-template>
    </div>
  `
})
export class AlunoListComponent implements OnInit {
  protected alunos$!: Observable<Aluno[]>;
  private alunoService = inject(AlunoService);

  ngOnInit(): void {
    this.alunos$ = this.alunoService.findAll();
  }
}
