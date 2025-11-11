import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { RelatorioAlunosPorCursoDTO, RelatorioAlunosPorDiagnosticoDTO, RelatorioService } from '../../core/services/api.service';
import { AlunoService } from '../../core/services/aluno.service';
import { map } from 'rxjs/operators';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private relatorioService = inject(RelatorioService);
  private alunoService = inject(AlunoService);

  protected totalAlunos$!: Observable<number>;
  protected relatorioCursos$!: Observable<RelatorioAlunosPorCursoDTO[]>;

  // MUDANÇA: Estes são para o gráfico de Rosca (Donut Chart)
  protected relatorioDiagnosticos$!: Observable<RelatorioAlunosPorDiagnosticoDTO[]>;
  protected diagnosticoChartStyle: string = '';
  protected totalDiagnosticosAlunos: number = 0;
  // Define a paleta de cores no componente
  protected chartColors: string[] = [
    'var(--cor-grafico-1)',
    'var(--cor-grafico-2)',
    'var(--cor-grafico-3)',
    'var(--cor-grafico-4)',
    'var(--cor-grafico-5)',
    'var(--cor-grafico-6)'
  ];

  // Para o gráfico de Barras
  protected maxCursoCount = 0;

  ngOnInit(): void {
    // Busca o total de alunos
    this.totalAlunos$ = this.alunoService.findAll().pipe(
      map(alunos => alunos.length)
    );

    // Gráfico 1: Alunos por Curso (Gráfico de Barras)
    this.relatorioCursos$ = this.relatorioService.getAlunosPorCurso().pipe(
      map(data => {
        this.maxCursoCount = Math.max(...data.map(item => item.totalAlunos), 0);
        return data;
      })
    );

    // Gráfico 2: Alunos por Diagnóstico (Gráfico de Rosca)
    this.relatorioDiagnosticos$ = this.relatorioService.getAlunosPorDiagnostico().pipe(
      map(data => {
        this.buildDonutChart(data);
        return data;
      })
    );
  }

  // Função para o gráfico de Barras
  protected getBarPercentage(value: number, max: number): string {
    if (max === 0) return '0%';
    const percentage = (value / max) * 100;
    return Math.max(percentage, 10) + '%'; // Mínimo de 10% para visibilidade
  }

  // MUDANÇA: Nova função para construir o gráfico de Rosca
  private buildDonutChart(data: RelatorioAlunosPorDiagnosticoDTO[]): void {
    if (!data || data.length === 0) {
      this.diagnosticoChartStyle = 'background: var(--cor-borda)';
      return;
    }

    const total = data.reduce((sum, item) => sum + item.totalAlunos, 0);
    this.totalDiagnosticosAlunos = total;

    let cumulativePercent = 0;
    const gradientParts: string[] = [];

    data.forEach((item, index) => {
      const percent = (item.totalAlunos / total) * 100;
      const color = this.chartColors[index % this.chartColors.length]; // Repete as cores se houver muitos dados

      // Define o início e o fim da fatia
      const startPercent = cumulativePercent;
      const endPercent = cumulativePercent + percent;

      gradientParts.push(`${color} ${startPercent}% ${endPercent}%`);

      cumulativePercent = endPercent;
    });

    // Define o estilo conic-gradient
    this.diagnosticoChartStyle = `background: conic-gradient(${gradientParts.join(', ')});`;
  }

  // Função de performance para o *ngFor da legenda
  protected trackByNome(index: number, item: RelatorioAlunosPorDiagnosticoDTO): string {
    return item.diagnosticoNome;
  }
}
