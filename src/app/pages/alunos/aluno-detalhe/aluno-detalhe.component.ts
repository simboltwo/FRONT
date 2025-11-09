import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Aluno } from '../../../core/models/aluno.model';
import { AlunoService } from '../../../core/services/aluno.service';

// Importa os componentes de Atendimento
import { AtendimentoFormComponent } from '../../atendimentos/atendimento-form/atendimento-form.component';
import { AtendimentoListComponent } from '../../atendimentos/atendimento-list/atendimento-list.component';

@Component({
  selector: 'app-aluno-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink, AtendimentoFormComponent, AtendimentoListComponent],
  templateUrl: './aluno-detalhe.component.html'
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

  // O formulário de atendimento emitirá um evento 'atendimentoSalvo'
  // Isso fará o componente de lista recarregar (demonstrado no .html)
  protected onAtendimentoSalvo(): void {
    this.showAtendimentoForm = false;
    // Recarrega os dados do aluno (e seus atendimentos, se necessário)
     this.aluno$ = this.alunoService.findById(this.alunoId);
  }
}
