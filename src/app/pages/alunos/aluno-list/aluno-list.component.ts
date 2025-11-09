import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, BehaviorSubject, switchMap, startWith, combineLatest, map } from 'rxjs';
import { Aluno, Curso, Diagnostico } from '../../../core/models/aluno.model';
import { AlunoService, AlunoFilter } from '../../../core/services/aluno.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CursoService, DiagnosticoService } from '../../../core/services/api.service';

@Component({
  selector: 'app-aluno-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule], // Adicione ReactiveFormsModule
  templateUrl: './aluno-list.component.html',
  styleUrls: ['./aluno-list.component.scss']
})
export class AlunoListComponent implements OnInit {
  // Serviços
  private alunoService = inject(AlunoService);
  private cursoService = inject(CursoService);
  private diagnosticoService = inject(DiagnosticoService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Observables para os dados
  protected alunos$!: Observable<Aluno[]>;
  protected cursos$!: Observable<Curso[]>;
  protected diagnosticos$!: Observable<Diagnostico[]>;

  // BehaviorSubject para permitir recarregar a lista
  private refresh$ = new BehaviorSubject<void>(undefined);

  // Formulário para os filtros
  protected filterForm = this.fb.group({
    nome: [''],
    cursoId: [null],
    diagnosticoId: [null]
  });

  ngOnInit(): void {
    // Carrega os dados para os dropdowns de filtro
    this.cursos$ = this.cursoService.findAll();
    this.diagnosticos$ = this.diagnosticoService.findAll();

    // Combina os filtros com o "refresh"
    const filters$ = this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value) // Começa com o valor inicial
    );

    // Ouve as mudanças no filtro OU no refresh$
    this.alunos$ = combineLatest([filters$, this.refresh$]).pipe(
      switchMap(([filters, _]) => {
        // Converte os valores do formulário para o formato do service
        const filterParams: AlunoFilter = {
          nome: filters.nome || undefined,
          cursoId: filters.cursoId ? Number(filters.cursoId) : undefined,
          diagnosticoId: filters.diagnosticoId ? Number(filters.diagnosticoId) : undefined,
        };
        return this.alunoService.findAll(filterParams);
      })
    );
  }

  // Limpa os filtros e recarrega
  clearFilters(): void {
    this.filterForm.reset({
      nome: '',
      cursoId: null,
      diagnosticoId: null
    });
  }

  // Lógica para o botão "Excluir"
  deleteAluno(event: MouseEvent, aluno: Aluno): void {
    event.stopPropagation(); // Impede o clique de ir para o card
    if (confirm(`Tem a certeza de que deseja excluir o(a) aluno(a) ${aluno.nome}? Esta ação não pode ser desfeita.`)) {
      this.alunoService.delete(aluno.id).subscribe({
        next: () => this.refresh$.next(),
        error: (err) => alert('Falha ao excluir o aluno.')
      });
    }
  }

  // Navega para a página de edição
  editAluno(event: MouseEvent, aluno: Aluno): void {
    event.stopPropagation(); // Impede o clique de ir para o card
    this.router.navigate(['/alunos', 'editar', aluno.id]);
  }

  // Navega para a página de detalhes (ao clicar no card)
  viewAluno(aluno: Aluno): void {
    this.router.navigate(['/alunos', 'detalhe', aluno.id]);
  }

  // --- NOVO: Método para o Botão Flutuante ---
  goToNewAlunoPage(): void {
    this.router.navigate(['/alunos/novo']);
  }
}
