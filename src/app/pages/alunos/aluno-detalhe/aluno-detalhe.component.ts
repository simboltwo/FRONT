import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Aluno } from '../../../core/models/aluno.model';
import { AlunoService } from '../../../core/services/aluno.service';

// Importa os componentes de Atendimento
import { AtendimentoForm } from '../../atendimentos/atendimento-form/atendimento-form.component';
import { AtendimentoList} from '../../atendimentos/atendimento-list/atendimento-list.component';

// --- IMPORTE OS NOVOS COMPONENTES ---
import { LaudoList } from '../../laudos/laudo-list/laudo-list.component';
import { PeiList } from '../../peis/pei-list/pei-list.component';

@Component({
  selector: 'app-aluno-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AtendimentoForm,
    AtendimentoList,
    LaudoList, // <-- Adicione
    PeiList  // <-- Adicione
  ],
  templateUrl: './aluno-detalhe.component.html',
  styleUrls: ['./aluno-detalhe.component.scss']
})
export class AlunoDetalheComponent implements OnInit {
  protected aluno$!: Observable<Aluno>;
  protected alunoId!: number;
  protected showAtendimentoForm = false;

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

  onAtendimentoSalvo(): void {
    this.showAtendimentoForm = false;
    // (Idealmente, o atendimento-list deveria recarregar sozinho)
  }
}
