import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Aluno } from '../../../core/models/aluno.model';
import { AlunoService, AlunoFilter } from '../../../core/services/aluno.service';

@Component({
  selector: 'app-aluno-vitrine',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './aluno-vitrine.component.html',
  styleUrls: ['./aluno-vitrine.component.scss']
})
export class AlunoVitrineComponent implements OnInit {

  private alunoService = inject(AlunoService);
  private router = inject(Router);

  protected alunos$!: Observable<Aluno[]>;
  private todayISO!: string; // Adicionado

  @ViewChild('carouselTrack') private carouselTrackEl!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this.todayISO = new Date().toISOString().split('T')[0];

    const filter: AlunoFilter = {
        atendimentoData: this.todayISO,
        atendimentoStatus: 'AGENDADO'
    };

    this.alunos$ = this.alunoService.findAll(filter).pipe(
      map(alunos => {
        return alunos
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .slice(0, 4);
      })
    );
  }

  protected viewAluno(aluno: Aluno): void {
    this.router.navigate(['/alunos', 'detalhe', aluno.id]);
  }

  protected atenderAluno(event: MouseEvent, aluno: Aluno): void {
    event.stopPropagation();
    this.viewAluno(aluno);
  }

  protected editAluno(event: MouseEvent, aluno: Aluno): void {
    event.stopPropagation();
    this.router.navigate(['/alunos', 'editar', aluno.id]);
  }

  protected deleteAluno(event: MouseEvent, aluno: Aluno): void {
    event.stopPropagation();
    // A vitrine não deve ter delete, é muito arriscado.
    // Vamos apenas navegar para a edição.
    this.editAluno(event, aluno);
  }

  // CORREÇÃO: Função do Carrossel
  protected scrollCarousel(direction: number): void {
    if (this.carouselTrackEl) {
      const scrollAmount = this.carouselTrackEl.nativeElement.clientWidth * 0.8;
      this.carouselTrackEl.nativeElement.scrollLeft += scrollAmount * direction;
    }
  }

  // --- Funções de UI (Mantidas, mas a lógica de prioridade não é usada no HTML) ---
  protected getDiagClass(sigla?: string): string {
    if (!sigla) return 'diag-default';
    switch (sigla.toUpperCase()) {
      case 'TEA': return 'diag-tea';
      case 'TDM': return 'diag-tdm';
      case 'TAG': return 'diag-tag';
      case 'TDAH': return 'diag-tdah';
      default: return 'diag-default';
    }
  }
}
