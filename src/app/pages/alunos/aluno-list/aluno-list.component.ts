import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core'; // REMOVIDO: AfterViewInit
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, BehaviorSubject, switchMap, startWith, combineLatest, map, tap } from 'rxjs';
import { Aluno, Curso, Diagnostico } from '../../../core/models/aluno.model';
import { AlunoService, AlunoFilter } from '../../../core/services/aluno.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CursoService, DiagnosticoService } from '../../../core/services/api.service';

@Component({
  selector: 'app-aluno-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './aluno-list.component.html',
  styleUrls: ['./aluno-list.component.scss']
})
// REMOVIDO: AfterViewInit
export class AlunoListComponent implements OnInit {
  // Serviços
  private alunoService = inject(AlunoService);
  private cursoService = inject(CursoService);
  private diagnosticoService = inject(DiagnosticoService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // MUDANÇA: Usando um setter para o ViewChild (mais robusto)
  private carouselTrackEl!: HTMLDivElement;
  @ViewChild('carouselTrack') set carouselTrackRef(el: ElementRef<HTMLDivElement> | undefined) {
    if (el) {
      // Assim que o Angular encontra o #carouselTrack, ele define a variável
      this.carouselTrackEl = el.nativeElement;
    }
  }

  // Observables para os dados
  protected alunos$!: Observable<Aluno[]>;
  protected cursos$!: Observable<Curso[]>;
  protected diagnosticos$!: Observable<Diagnostico[]>;
  protected alunosCount$!: Observable<number>;

  protected sortOptions = [
    { value: 'nome-asc', label: 'Nome (A-Z)' },
    { value: 'nome-desc', label: 'Nome (Z-A)' },
    { value: 'matricula-asc', label: 'Matrícula (Mais Antiga)' },
    { value: 'matricula-desc', label: 'Matrícula (Mais Recente)' }
  ];

  private refresh$ = new BehaviorSubject<void>(undefined);

  protected filterForm = this.fb.group({
    nome: [''],
    cursoIds: this.fb.control<number[]>([]),
    diagnosticoIds: this.fb.control<number[]>([]),
    sort: this.fb.control('nome-asc', [Validators.required])
  });


  ngOnInit(): void {
    this.cursos$ = this.cursoService.findAll();
    this.diagnosticos$ = this.diagnosticoService.findAll();

    const filters$ = this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value)
    );

    this.alunos$ = combineLatest([filters$, this.refresh$]).pipe(
      switchMap(([filters, _]) => {
        const filterParams: AlunoFilter = {
          nome: filters.nome || undefined
        };
        return this.alunoService.findAll(filterParams);
      }),
      map(alunos => {
        // (Lógica de filtro e sort)
        const { cursoIds, diagnosticoIds } = this.filterForm.value;
        let alunosFiltrados = [...alunos];

        if (cursoIds && cursoIds.length > 0) {
          alunosFiltrados = alunosFiltrados.filter(aluno =>
            cursoIds.includes(aluno.curso.id)
          );
        }

        if (diagnosticoIds && diagnosticoIds.length > 0) {
          alunosFiltrados = alunosFiltrados.filter(aluno =>
            aluno.diagnosticos.some(diag => diagnosticoIds.includes(diag.id))
          );
        }

        const sortValue = this.filterForm.value.sort;
        return this.sortAlunos(alunosFiltrados, sortValue || 'nome-asc');
      }),
      tap(alunos => this.updateAlunoCount(alunos.length))
    );

    this.alunosCount$ = this.alunos$.pipe(map(alunos => alunos.length));
  }

  // REMOVIDO: ngAfterViewInit()

  // Esta função agora funcionará
  protected scrollCarousel(direction: number): void {
    if (this.carouselTrackEl) {
      const scrollAmount = this.carouselTrackEl.clientWidth * 0.8;
      this.carouselTrackEl.scrollLeft += scrollAmount * direction;
    }
  }

  private updateAlunoCount(count: number): void {
    // ...
  }

  private sortAlunos(alunos: Aluno[], sortValue: string): Aluno[] {
    const alunosOrdenados = [...alunos];
    switch (sortValue) {
      case 'nome-asc': return alunosOrdenados.sort((a, b) => a.nome.localeCompare(b.nome));
      case 'nome-desc': return alunosOrdenados.sort((a, b) => b.nome.localeCompare(a.nome));
      case 'matricula-asc': return alunosOrdenados.sort((a, b) => a.matricula.localeCompare(b.matricula));
      case 'matricula-desc': return alunosOrdenados.sort((a, b) => b.matricula.localeCompare(a.matricula));
      default: return alunosOrdenados;
    }
  }

  // --- Funções para Checkbox ---
  onCursoChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const id = Number(target.value);
    let A_ids: number[] = this.filterForm.get('cursoIds')?.value || [];

    if (target.checked) {
      if (!A_ids.includes(id)) A_ids.push(id);
    } else {
      A_ids = A_ids.filter(item => item !== id);
    }
    this.filterForm.get('cursoIds')?.setValue(A_ids);
  }

  isCursoChecked(id: number): boolean {
    const A_ids: number[] = this.filterForm.get('cursoIds')?.value || [];
    return A_ids.includes(id);
  }

  getCursoSelecionadoTexto(): string {
    const count = this.filterForm.get('cursoIds')?.value?.length || 0;
    if (count === 0) return 'Curso';
    return `Curso (${count})`;
  }

  onDiagnosticoChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const id = Number(target.value);
    let A_ids: number[] = this.filterForm.get('diagnosticoIds')?.value || [];

    if (target.checked) {
      if (!A_ids.includes(id)) A_ids.push(id);
    } else {
      A_ids = A_ids.filter(item => item !== id);
    }
    this.filterForm.get('diagnosticoIds')?.setValue(A_ids);
  }

  isDiagnosticoChecked(id: number): boolean {
    const A_ids: number[] = this.filterForm.get('diagnosticoIds')?.value || [];
    return A_ids.includes(id);
  }

  getDiagnosticoSelecionadoTexto(): string {
    const count = this.filterForm.get('diagnosticoIds')?.value?.length || 0;
    if (count === 0) return 'Diagnóstico';
    return `Diagnóstico (${count})`;
  }

  getSortSelecionadoNome(): string {
    const value = this.filterForm.get('sort')?.value;
    return this.sortOptions.find(opt => opt.value === value)?.label || 'Ordenar por';
  }

  clearFilters(): void {
    this.filterForm.reset({
      nome: '',
      cursoIds: [],
      diagnosticoIds: [],
      sort: 'nome-asc'
    });
  }

  protected trackByAlunoId(index: number, aluno: Aluno): number {
    return aluno.id;
  }

  protected get cursoFilterCount(): number {
    const control = this.filterForm.get('cursoIds');
    return control?.value?.length || 0;
  }

  protected get diagnosticoFilterCount(): number {
    const control = this.filterForm.get('diagnosticoIds');
    return control?.value?.length || 0;
  }

  protected getDiagClass(sigla?: string): string {
    if (!sigla) return 'diag-default';

    switch (sigla.toUpperCase()) {
      case 'TEA': return 'diag-tea';
      case 'TDM': return 'diag-tdm';
      case 'TAG': return 'diag-tag';
      case 'TDAH': return 'diag-tdah';
      // Adicione outros casos aqui
      default: return 'diag-default';
    }
  }

  // --- Navegação e Ações ---
  deleteAluno(event: MouseEvent, aluno: Aluno): void {
    event.stopPropagation();
    if (confirm(`Tem a certeza de que deseja excluir o(a) aluno(a) ${aluno.nome}? Esta ação não pode ser desfeita.`)) {
      this.alunoService.delete(aluno.id).subscribe({
        next: () => this.refresh$.next(),
        error: (err) => alert('Falha ao excluir o aluno.')
      });
    }
  }

  editAluno(event: MouseEvent, aluno: Aluno): void {
    event.stopPropagation();
    this.router.navigate(['/alunos', 'editar', aluno.id]);
  }

  viewAluno(aluno: Aluno): void {
    this.router.navigate(['/alunos', 'detalhe', aluno.id]);
  }

  goToNewAlunoPage(): void {
    this.router.navigate(['/alunos/novo']);
  }
}
