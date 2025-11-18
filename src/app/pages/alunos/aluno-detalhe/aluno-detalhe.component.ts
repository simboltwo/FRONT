/*
 * Arquivo: simboltwo/front/FRONT-6ada510ac5875a89a10169e7efd5d09b58529961/src/app/pages/alunos/aluno-detalhe/aluno-detalhe.component.ts
 * Descrição: Injetado RelatorioService e ToastService, adicionado método 'gerarRelatorioPDF'.
 */
import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, switchMap, Observable, map, finalize } from 'rxjs'; // Importar finalize
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

// --- INÍCIO DA MUDANÇA ---
import { RelatorioService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { saveAs } from 'file-saver';
// --- FIM DA MUDANÇA ---


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
  protected isDownloadingPDF = false; // --- INÍCIO DA MUDANÇA ---

  private route = inject(ActivatedRoute);
  private alunoService = inject(AlunoService);
  private authService = inject(AuthService);
  private refresh$ = new BehaviorSubject<void>(undefined);

  // --- INÍCIO DA MUDANÇA ---
  private relatorioService = inject(RelatorioService);
  private toastService = inject(ToastService);
  // --- FIM DA MUDANÇA ---

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
        this.toastService.show('Status do aluno atualizado!', 'success'); // Feedback
      },
      error: (err) => {
        this.toastService.show('Erro ao salvar. A página será recarregada.', 'danger');
        console.error('Falha ao atualizar aluno:', err);
        this.refresh$.next();
      }
    });
  }

  // --- INÍCIO DA MUDANÇA: Novo método para PDF ---
  protected gerarRelatorioPDF(): void {
    if (!this.aluno) return;

    this.isDownloadingPDF = true;

    this.relatorioService.downloadHistoricoAlunoPDF(this.aluno.id).pipe(
      finalize(() => this.isDownloadingPDF = false)
    ).subscribe({
      next: (blob) => {
        // Usa o file-saver para salvar o arquivo
        saveAs(blob, `Relatorio-Historico-${this.aluno?.matricula}.pdf`);
        this.toastService.show('Relatório PDF gerado com sucesso!', 'success');
      },
      error: (err) => {
        this.toastService.show('Erro ao gerar o relatório PDF.', 'danger');
        console.error(err);
      }
    });
  }
  // --- FIM DA MUDANÇA ---

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
    this.toastService.show('Agendamento salvo com sucesso!', 'success'); // Feedback
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
    this.toastService.show('Laudo salvo com sucesso!', 'success'); // Feedback
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
    this.toastService.show('PEI salvo com sucesso!', 'success'); // Feedback
  }
}
