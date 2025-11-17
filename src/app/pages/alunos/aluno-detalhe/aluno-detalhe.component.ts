import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, switchMap, Observable, map } from 'rxjs';
import { Aluno, AlunoStatusUpdate, Diagnostico } from '../../../core/models/aluno.model';
import { AlunoService } from '../../../core/services/aluno.service';

import { AtendimentoForm } from '../../atendimentos/atendimento-form/atendimento-form.component';
import { AtendimentoList } from '../../atendimentos/atendimento-list/atendimento-list.component';
import { LaudoList } from '../../laudos/laudo-list/laudo-list.component';
import { LaudoForm } from '../../laudos/laudo-form/laudo-form.component';
import { PeiList } from '../../peis/pei-list/pei-list.component';
import { PeiForm } from '../../peis/pei-form/pei-form.component';
import { AuthService } from '../../../core/services/auth.service';

import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-aluno-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AtendimentoForm,
    AtendimentoList,
    LaudoList,
    LaudoForm,
    PeiList,
    PeiForm
  ],
  templateUrl: './aluno-detalhe.component.html',
  styleUrls: ['./aluno-detalhe.component.scss']
})
export class AlunoDetalheComponent implements OnInit {
  @ViewChild(AtendimentoList) private atendimentoListComponent!: AtendimentoList;
  @ViewChild(LaudoList) private laudoListComponent!: LaudoList;
  @ViewChild(PeiList) private peiListComponent!: PeiList;

  protected aluno: Aluno | null = null;
  protected alunoId!: number;
  protected canEditPei$!: Observable<boolean>;

  private route = inject(ActivatedRoute);
  private alunoService = inject(AlunoService);
  private authService = inject(AuthService);
  private refresh$ = new BehaviorSubject<void>(undefined);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.alunoId = +params.get('id')!;
        return this.refresh$.pipe(
          switchMap(() => this.alunoService.findById(this.alunoId))
        );
      })
    ).subscribe(alunoData => {
      this.aluno = alunoData;
    });

    this.canEditPei$ = this.authService.currentUser$.pipe(
      map(user => user?.papeis.some(p =>
        p.authority === 'ROLE_COORDENADOR_NAAPI' ||
        p.authority === 'ROLE_MEMBRO_TECNICO'
      ) || false)
    );
  }

  /**
   * MÉTODO REFATORADO (PATCH)
   */
  protected updateAlunoField(field: 'prioridade' | 'provaOutroEspaco', value: any): void {
    if (!this.aluno) return;

    // 1. Otimismo na UI
    (this.aluno as any)[field] = value;

    // 2. DTO Leve
    const updatePayload: AlunoStatusUpdate = {};
    if (field === 'prioridade') {
      updatePayload.prioridade = value;
    }
    if (field === 'provaOutroEspaco') {
      updatePayload.provaOutroEspaco = value;
    }

    // 3. Chama o novo serviço PATCH
    this.alunoService.updateStatus(this.aluno.id, updatePayload).subscribe({
      next: (updatedAluno) => {
        this.aluno = updatedAluno;
      },
      error: (err) => {
        console.error('Falha ao atualizar aluno:', err);
        alert('Erro ao salvar. A página será recarregada para reverter a mudança.');
        this.refresh$.next();
      }
    });
  }

  onAtendimentoSalvo(): void {
    const modalElement = document.getElementById('modalAtendimento');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    if (this.atendimentoListComponent) {
      this.atendimentoListComponent.refresh();
    }
    this.refresh$.next();
  }

  onLaudoSalvo(): void {
    const modalElement = document.getElementById('modalLaudo');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    if (this.laudoListComponent) {
      this.laudoListComponent.refresh();
    }
  }

  onPeiSalvo(): void {
    const modalElement = document.getElementById('modalPei');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    if (this.peiListComponent) {
      this.peiListComponent.refresh();
    }
  }
}
