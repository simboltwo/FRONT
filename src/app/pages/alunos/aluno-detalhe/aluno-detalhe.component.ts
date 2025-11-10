import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Aluno } from '../../../core/models/aluno.model';
import { AlunoService } from '../../../core/services/aluno.service';

// Importa os componentes de Atendimento
import { AtendimentoForm } from '../../atendimentos/atendimento-form/atendimento-form.component';
import { AtendimentoList } from '../../atendimentos/atendimento-list/atendimento-list.component';

// Importe os outros componentes
import { LaudoList } from '../../laudos/laudo-list/laudo-list.component';
import { PeiList } from '../../peis/pei-list/pei-list.component';

// MUDANÇA: Importar o Bootstrap para controlar o modal
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
  protected aluno$!: Observable<Aluno>;
  protected alunoId!: number;

  // MUDANÇA: Esta variável não é mais necessária
  // protected showAtendimentoForm = false;

  private route = inject(ActivatedRoute);
  private alunoService = inject(AlunoService);

  ngOnInit(): void {
    this.aluno$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.alunoId = +params.get('id')!;
        return this.alunoService.findById(this.alunoId);
      })
    );
  }

  // MUDANÇA: Esta função agora fecha o modal
  onAtendimentoSalvo(): void {
    const modalElement = document.getElementById('modalAtendimento');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    // Idealmente, a lista de atendimentos (child) deve ser notificada para recarregar
    // No nosso caso, o AtendimentoList já recarrega quando o ID muda,
    // mas se quisermos recarregar após salvar, precisaríamos de um BehaviorSubject
    // Por agora, o modal a fechar é o principal.
  }
}
