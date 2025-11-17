import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, switchMap } from 'rxjs'; // MUDANÇA
import { Aluno, AlunoInsert, Diagnostico } from '../../../core/models/aluno.model'; // MUDANÇA
import { AlunoService } from '../../../core/services/aluno.service';

import { AtendimentoForm } from '../../atendimentos/atendimento-form/atendimento-form.component';
import { AtendimentoList } from '../../atendimentos/atendimento-list/atendimento-list.component';
import { LaudoList } from '../../laudos/laudo-list/laudo-list.component';
import { PeiList } from '../../peis/pei-list/pei-list.component';

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
    PeiList
  ],
  templateUrl: './aluno-detalhe.component.html',
  styleUrls: ['./aluno-detalhe.component.scss']
})
export class AlunoDetalheComponent implements OnInit {
  @ViewChild(AtendimentoList) private atendimentoListComponent!: AtendimentoList;

  // MUDANÇA: 'aluno' agora é uma propriedade local, não um observable
  protected aluno: Aluno | null = null;
  protected alunoId!: number;

  private route = inject(ActivatedRoute);
  private alunoService = inject(AlunoService);

  // MUDANÇA: Subject para forçar o recarregamento dos dados
  private refresh$ = new BehaviorSubject<void>(undefined);

  ngOnInit(): void {
    // A rota define o ID, e o refresh$ (ou o ID) recarrega os dados
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
  }

  /**
   * MUDANÇA: Método de Edição Inline
   * Chamado pelas "bolinhas" e botões "Sim/Não"
   */
  protected updateAlunoField(field: 'prioridade' | 'provaOutroEspaco', value: any): void {
    if (!this.aluno) return;

    // 1. Otimismo: Atualiza a UI imediatamente
    (this.aluno as any)[field] = value;

    // 2. Cria o DTO de atualização a partir dos dados atuais
    // (Usamos o modelo AlunoInsert que já criámos)
    const alunoDTO: AlunoInsert = {
      nome: this.aluno.nome,
      nomeSocial: this.aluno.nomeSocial,
      dataNascimento: this.aluno.dataNascimento,
      cpf: this.aluno.cpf,
      telefoneEstudante: this.aluno.telefoneEstudante,
      matricula: this.aluno.matricula,
      prioridade: this.aluno.prioridade,
      provaOutroEspaco: this.aluno.provaOutroEspaco,
      processoSipac: this.aluno.processoSipac,
      cursoId: this.aluno.curso.id,
      turmaId: this.aluno.turma.id,
      diagnosticosId: this.aluno.diagnosticos.map((d: Diagnostico) => d.id),
      anotacoesNaapi: this.aluno.anotacoesNaapi,
      adaptacoesNecessarias: this.aluno.adaptacoesNecessarias,
      necessidadesRelatoriosMedicos: this.aluno.necessidadesRelatoriosMedicos,
    };

    // 3. Cria o FormData (necessário pelo AlunoService)
    const formData = new FormData();
    formData.append('alunoDTO', new Blob([JSON.stringify(alunoDTO)], {
      type: 'application/json'
    }));

    // 4. Chama o serviço de atualização
    this.alunoService.updateWithFile(this.aluno.id, formData).subscribe({
      next: (updatedAluno) => {
        // 5. Atualiza os dados locais com a resposta (confirmação)
        this.aluno = updatedAluno;
        // (Aqui seria um bom local para um toast de "Salvo!")
      },
      error: (err) => {
        console.error('Falha ao atualizar aluno:', err);
        alert('Erro ao salvar. A página será recarregada para reverter a mudança.');
        this.refresh$.next(); // Recarrega para reverter a mudança visual
      }
    });
  }

  // MUDANÇA: Atualiza o 'refresh$' ao salvar o atendimento
  onAtendimentoSalvo(): void {
    const modalElement = document.getElementById('modalAtendimento');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    // Atualiza a lista de atendimentos E os dados do aluno
    if (this.atendimentoListComponent) {
      this.atendimentoListComponent.refresh();
    }
    this.refresh$.next();
  }
}
