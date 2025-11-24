import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { RelatorioAlunosPorCursoDTO, RelatorioAlunosPorDiagnosticoDTO, RelatorioKpiDTO, RelatorioService } from '../../core/services/api.service';
import { AlunoService } from '../../core/services/aluno.service';
import { map } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { AlunoListComponent } from '../alunos/aluno-list/aluno-list.component';
import { AlunoVitrineComponent } from './aluno-vitrine/aluno-vitrine.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, AlunoListComponent, AlunoVitrineComponent],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {
  private relatorioService = inject(RelatorioService);
  private alunoService = inject(AlunoService);

  protected totalAgendadosHoje$!: Observable<number>;
  protected totalRealizadosHoje$!: Observable<number>;
  protected totalAgendados$!: Observable<number>;
  protected totalRealizados$!: Observable<number>;
  protected relatorioCursos$!: Observable<RelatorioAlunosPorCursoDTO[]>;
  protected relatorioDiagnosticos$!: Observable<RelatorioAlunosPorDiagnosticoDTO[]>;
  protected diagnosticoChartStyle: string = '';
  protected totalDiagnosticosAlunos: number = 0;
  protected chartColors: string[] = [
    'var(--cor-grafico-1)', 'var(--cor-grafico-2)', 'var(--cor-grafico-3)',
    'var(--cor-grafico-4)', 'var(--cor-grafico-5)', 'var(--cor-grafico-6)'
  ];
  protected maxCursoCount = 0;
  private todayISO: string = '';

  ngOnInit(): void {
    this.todayISO = new Date().toISOString().split('T')[0];


    this.totalAgendadosHoje$ = this.relatorioService.getTotalAtendimentosPorData(this.todayISO, 'AGENDADO').pipe(map(dto => dto.total));
    this.totalRealizadosHoje$ = this.relatorioService.getTotalAtendimentosPorData(this.todayISO, 'REALIZADO').pipe(map(dto => dto.total));

    this.relatorioCursos$ = this.relatorioService.getAlunosPorCurso().pipe(
      map(data => {
        this.maxCursoCount = Math.max(...data.map(item => item.totalAlunos), 0);
        return data;
      })
    );
    this.relatorioDiagnosticos$ = this.relatorioService.getAlunosPorDiagnostico().pipe(
      map(data => {
        this.buildDonutChart(data);
        return data;
      })
    );
  }

  protected getBarPercentage(value: number, max: number): string {
    if (max === 0) return '0%';
    const percentage = (value / max) * 100;
    return Math.max(percentage, 10) + '%';
  }

  private buildDonutChart(data: RelatorioAlunosPorDiagnosticoDTO[]): void {
    if (!data || data.length === 0) {
      this.diagnosticoChartStyle = 'var(--cor-borda)';
      return;
    }
    const total = data.reduce((sum, item) => sum + item.totalAlunos, 0);
    this.totalDiagnosticosAlunos = total;
    let cumulativePercent = 0;
    const gradientParts: string[] = [];
    data.forEach((item, index) => {
      const percent = (item.totalAlunos / total) * 100;
      const color = this.chartColors[index % this.chartColors.length];
      const startPercent = cumulativePercent;
      const endPercent = cumulativePercent + percent;
      gradientParts.push(`${color} ${startPercent}% ${endPercent}%`);
      cumulativePercent = endPercent;
    });
    this.diagnosticoChartStyle = `conic-gradient(${gradientParts.join(', ')})`;
  }

  protected trackByNome(index: number, item: RelatorioAlunosPorDiagnosticoDTO): string {
    return item.diagnosticoNome;
  }
}
