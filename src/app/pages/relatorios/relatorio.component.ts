// src/app/pages/relatorios/relatorio.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { RelatorioAlunosPorCursoDTO, RelatorioAlunosPorDiagnosticoDTO, RelatorioService } from '../../core/services/api.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatorio.component.html',
  styleUrls: ['./relatorio.component.scss']
})
export class RelatorioComponent implements OnInit {

  private relatorioService = inject(RelatorioService);

  // Observables para os gráficos
  protected relatorioCursos$!: Observable<RelatorioAlunosPorCursoDTO[]>;
  protected relatorioDiagnosticos$!: Observable<RelatorioAlunosPorDiagnosticoDTO[]>;

  // MUDANÇA: Nova propriedade para o total
  protected totalDiagnosticosAlunos = 0;

  protected diagnosticoChartStyle: string = '';
  protected maxCursoCount = 0;
  protected chartColors: string[] = [
    'var(--cor-grafico-1)', 'var(--cor-grafico-2)', 'var(--cor-grafico-3)',
    'var(--cor-grafico-4)', 'var(--cor-grafico-5)', 'var(--cor-grafico-6)'
  ];

  ngOnInit(): void {
    // Gráfico 1: Alunos por Curso
    this.relatorioCursos$ = this.relatorioService.getAlunosPorCurso().pipe(
      map(data => {
        this.maxCursoCount = Math.max(...data.map(item => item.totalAlunos), 0);
        return data;
      })
    );

    // Gráfico 2: Alunos por Diagnóstico
    this.relatorioDiagnosticos$ = this.relatorioService.getAlunosPorDiagnostico().pipe(
      map(data => {
        this.buildDonutChart(data); // Este método agora calcula o total
        return data;
      })
    );
  }

  // --- MÉTODOS PARA DOWNLOAD ---

  protected downloadCursoCSV(): void {
    this.relatorioService.exportarAlunosPorCursoCSV().subscribe(csvData => {
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'relatorio_alunos_por_curso.csv');
    });
  }

  protected downloadDiagnosticoCSV(): void {
    this.relatorioService.exportarAlunosPorDiagnosticoCSV().subscribe(csvData => {
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'relatorio_alunos_por_diagnostico.csv');
    });
  }

  // --- Métodos auxiliares para os gráficos ---

  protected getBarPercentage(value: number, max: number): string {
    if (max === 0) return '0%';
    const percentage = (value / max) * 100;
    return Math.max(percentage, 10) + '%';
  }

  private buildDonutChart(data: RelatorioAlunosPorDiagnosticoDTO[]): void {
    if (!data || data.length === 0) {
      this.diagnosticoChartStyle = 'var(--cor-borda)';
      this.totalDiagnosticosAlunos = 0; // MUDANÇA
      return;
    }
    const total = data.reduce((sum, item) => sum + item.totalAlunos, 0);

    // MUDANÇA: Armazena o total
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
