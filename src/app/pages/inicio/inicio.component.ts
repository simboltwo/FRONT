// MUDANÇA: Importa AfterViewInit, ViewChild, ElementRef
import { Component, OnInit, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import {
  RelatorioAlunosPorCursoDTO,
  RelatorioAlunosPorDiagnosticoDTO,
  RelatorioGenericoDTO,
  RelatorioKpiDTO,
  RelatorioService
} from '../../core/services/api.service';
import { map, catchError } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { AlunoListComponent } from '../alunos/aluno-list/aluno-list.component';

// MUDANÇA: Importa o objeto Carousel do Bootstrap
import { Carousel } from 'bootstrap';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AlunoListComponent],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
// MUDANÇA: Implementa o AfterViewInit
export class DashboardComponent implements OnInit, AfterViewInit {
  private relatorioService = inject(RelatorioService);

  // --- KPIs ---
  protected totalAlunosAtivos$!: Observable<RelatorioKpiDTO>;
  protected totalAtendimentosRealizados$!: Observable<RelatorioKpiDTO>;
  protected totalAtendimentosAgendados$!: Observable<RelatorioKpiDTO>;

  // --- Gráficos ---
  protected relatorioCursos$!: Observable<RelatorioAlunosPorCursoDTO[]>;
  protected relatorioDiagnosticos$!: Observable<RelatorioAlunosPorDiagnosticoDTO[]>;
  protected relatorioPrioridade$!: Observable<RelatorioGenericoDTO[]>;
  protected relatorioAtendimentosMes$!: Observable<RelatorioGenericoDTO[]>;
  protected relatorioAtendimentosResp$!: Observable<RelatorioGenericoDTO[]>;

  // --- Auxiliares de Gráfico ---
  protected maxCursoCount = 0;
  protected maxAtendimentoRespCount = 0;
  protected maxAtendimentoMesCount = 0;

  protected diagnosticoChartStyle: string = '';
  protected prioridadeChartStyle: string = '';

  protected chartColors: string[] = [
    'var(--cor-grafico-1)', 'var(--cor-grafico-2)', 'var(--cor-grafico-3)',
    'var(--cor-grafico-4)', 'var(--cor-grafico-5)', 'var(--cor-grafico-6)'
  ];

  protected prioridadeChartColors: { [key: string]: string } = {
    'Alta': 'var(--cor-perigo)',
    'Média': 'var(--cor-aviso)',
    'Baixa': 'var(--cor-sucesso)'
  };

  // MUDANÇA: Referência ao elemento do carrossel no HTML
  @ViewChild('graphCarouselEl') private carouselElement!: ElementRef;
  private carouselInstance: Carousel | null = null;


  ngOnInit(): void {
    // --- Carregar KPIs ---
    this.totalAlunosAtivos$ = this.relatorioService.getTotalAlunosAtivos().pipe(catchError(() => of({ total: 0 })));
    this.totalAtendimentosRealizados$ = this.relatorioService.getTotalAtendimentosPorStatus('REALIZADO').pipe(catchError(() => of({ total: 0 })));
    this.totalAtendimentosAgendados$ = this.relatorioService.getTotalAtendimentosPorStatus('AGENDADO').pipe(catchError(() => of({ total: 0 })));

    // --- Carregar Gráficos ---
    this.relatorioCursos$ = this.relatorioService.getAlunosPorCurso().pipe(
      map(data => {
        this.maxCursoCount = Math.max(...data.map(item => item.totalAlunos), 0);
        return data.sort((a, b) => b.totalAlunos - a.totalAlunos); // Ordena
      }),
      catchError(() => of([]))
    );

    this.relatorioDiagnosticos$ = this.relatorioService.getAlunosPorDiagnostico().pipe(
      map(data => {
        const sortedData = data.sort((a, b) => b.totalAlunos - a.totalAlunos);
        this.diagnosticoChartStyle = this.buildDonutChart(sortedData, this.chartColors);
        return sortedData;
      }),
      catchError(() => of([]))
    );

    this.relatorioPrioridade$ = this.relatorioService.getAlunosPorPrioridade().pipe(
      map(data => {
        const order = ['Alta', 'Média', 'Baixa'];
        const sortedData = data.sort((a, b) => order.indexOf(a.nome) - order.indexOf(b.nome));
        const colors = sortedData.map(d => this.prioridadeChartColors[d.nome] || '#ccc');
        this.prioridadeChartStyle = this.buildDonutChart(sortedData, colors);
        return sortedData;
      }),
      catchError(() => of([]))
    );

    this.relatorioAtendimentosMes$ = this.relatorioService.getAtendimentosPorMes().pipe(
      map(data => {
         this.maxAtendimentoMesCount = Math.max(...data.map(item => item.total), 0);
         return data;
      }),
      catchError(() => of([]))
    );

    this.relatorioAtendimentosResp$ = this.relatorioService.getAtendimentosPorResponsavel().pipe(
      map(data => {
         this.maxAtendimentoRespCount = Math.max(...data.map(item => item.total), 0);
         return data.sort((a, b) => b.total - a.total); // Ordena
      }),
      catchError(() => of([]))
    );
  }

  // MUDANÇA: Novo método para iniciar o carrossel
  ngAfterViewInit(): void {
    // Verificamos se o elemento HTML existe
    if (this.carouselElement) {
      // Inicializa o carrossel manualmente via TypeScript
      this.carouselInstance = new Carousel(this.carouselElement.nativeElement, {
        interval: 4000, // 5 segundos
        ride: 'carousel', // Inicia o auto-play assim que for inicializado
        pause: 'hover' // Pausa quando o rato está em cima
      });
    }
  }

  // --- Funções Auxiliares (Gráficos) ---

  protected getBarPercentage(value: number, max: number): string {
    if (max === 0) return '0%';
    const percentage = (value / max) * 100;
    return Math.max(percentage, 8) + '%';
  }

  private buildDonutChart(data: (RelatorioGenericoDTO | RelatorioAlunosPorDiagnosticoDTO)[], colors: string[]): string {
    if (!data || data.length === 0) {
      return 'var(--cor-borda)';
    }

    const total = data.reduce((sum, item) => sum + ('totalAlunos' in item ? item.totalAlunos : item.total), 0);

    let cumulativePercent = 0;
    const gradientParts: string[] = [];

    data.forEach((item, index) => {
      const valor = ('totalAlunos' in item ? item.totalAlunos : item.total);
      const percent = (valor / total) * 100;
      const color = colors[index % colors.length];
      const startPercent = cumulativePercent;
      const endPercent = cumulativePercent + percent;
      gradientParts.push(`${color} ${startPercent}% ${endPercent}%`);
      cumulativePercent = endPercent;
    });

    return `conic-gradient(${gradientParts.join(', ')})`;
  }

  protected trackByNome(index: number, item: any): string {
    return item.diagnosticoNome || item.cursoNome || item.nome;
  }
}
