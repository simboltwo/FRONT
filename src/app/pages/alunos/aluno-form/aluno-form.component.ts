import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
// MUDANÇA: Importar FormControl
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// MUDANÇA: Importar mais operadores RxJS
import { Observable, BehaviorSubject, combineLatest, startWith, map } from 'rxjs';
import { Aluno, AlunoInsert, Curso, Diagnostico, Turma } from '../../../core/models/aluno.model';
import { AlunoService } from '../../../core/services/aluno.service';
import { CursoService, DiagnosticoService, TurmaService } from '../../../core/services/api.service';

@Component({
  selector: 'app-aluno-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './aluno-form.component.html',
  styleUrls: ['./aluno-form.component.scss']
})
export class AlunoFormComponent implements OnInit {
  // Serviços
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private alunoService = inject(AlunoService);
  private cursoService = inject(CursoService);
  private turmaService = inject(TurmaService);
  private diagnosticoService = inject(DiagnosticoService);

  // Estado
  protected mainForm!: FormGroup;
  protected currentStep = 1;
  protected isEditMode = false;
  protected alunoId: number | null = null;
  protected isLoading = false;
  protected errorMessage: string | null = null;

  // Para o Upload
  protected previewUrl: string | ArrayBuffer | null = null;
  protected currentFotoUrl: string | null = null;

  // Dados
  protected cursos$!: Observable<Curso[]>;
  protected turmas$!: Observable<Turma[]>;
  protected diagnosticos$!: Observable<Diagnostico[]>;

  // MUDANÇA: Controladores para o filtro de diagnóstico
  protected diagnosticoSearch = new FormControl('');
  protected filteredDiagnosticos$!: Observable<Diagnostico[]>;
  // Fim da Mudança

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();
    this.checkEditMode();

    // MUDANÇA: Inicializa o observable de diagnósticos filtrados
    this.filteredDiagnosticos$ = combineLatest([
      this.diagnosticos$,
      this.diagnosticoSearch.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([diagnosticos, searchTerm]) => {
        const filter = (searchTerm || '').toLowerCase().trim();
        if (!filter) {
          return diagnosticos; // Retorna todos se a busca estiver vazia
        }
        // Filtra por nome ou sigla
        return diagnosticos.filter(diag =>
          diag.nome.toLowerCase().includes(filter) ||
          diag.sigla?.toLowerCase().includes(filter)
        );
      })
    );
    // Fim da Mudança
  }

  // 1. Inicializa o formulário com 3 etapas
  private initForm(): void {
    this.mainForm = this.fb.group({
      // Etapa 1: Dados Pessoais
      dadosPessoais: this.fb.group({
        nome: ['', [Validators.required, Validators.minLength(3)]],
        nomeSocial: [''],
        dataNascimento: [''],
        cpf: [''],
        telefoneEstudante: [''],
        fotoFile: [null]
      }),
      // Etapa 2: Dados Acadêmicos
      dadosAcademicos: this.fb.group({
        matricula: ['', [Validators.required]],
        cursoId: [null, [Validators.required]],
        turmaId: [null, [Validators.required]],
        prioridade: ['Baixa', [Validators.required]],
        provaOutroEspaco: [false, [Validators.required]],
        processoSipac: ['']
      }),
      // Etapa 3: Dados NAAPI
      dadosNaapi: this.fb.group({
        diagnosticosId: this.fb.control([]),
        adaptacoesNecessarias: [''],
        necessidadesRelatoriosMedicos: [''],
        anotacoesNaapi: ['']
      })
    });
  }

  // 2. Carrega dados
  private loadDropdownData(): void {
    this.cursos$ = this.cursoService.findAll();
    this.turmas$ = this.turmaService.findAll();
    this.diagnosticos$ = this.diagnosticoService.findAll();
  }

  // 3. Verifica modo de edição
  private checkEditMode(): void {
    this.alunoId = this.route.snapshot.params['id'];
    if (this.alunoId) {
      this.isEditMode = true;
      this.loadAlunoData(this.alunoId);
    }
  }

  // 4. Carrega dados do Aluno
  private loadAlunoData(id: number): void {
    this.isLoading = true;
    this.alunoService.findById(id).subscribe({
      next: (aluno: Aluno) => {
        this.mainForm.patchValue({
          dadosPessoais: {
            nome: aluno.nome,
            nomeSocial: aluno.nomeSocial,
            dataNascimento: aluno.dataNascimento,
            cpf: aluno.cpf,
            telefoneEstudante: aluno.telefoneEstudante
          },
          dadosAcademicos: {
            matricula: aluno.matricula,
            cursoId: aluno.curso.id,
            turmaId: aluno.turma.id,
            prioridade: aluno.prioridade,
            provaOutroEspaco: aluno.provaOutroEspaco,
            processoSipac: aluno.processoSipac
          },
          dadosNaapi: {
            diagnosticosId: aluno.diagnosticos.map((d: Diagnostico) => d.id),
            adaptacoesNecessarias: aluno.adaptacoesNecessarias,
            necessidadesRelatoriosMedicos: aluno.necessidadesRelatoriosMedicos,
            anotacoesNaapi: aluno.anotacoesNaapi
          }
        });

        if (aluno.foto) {
          this.currentFotoUrl = aluno.foto;
          this.previewUrl = null;
        }

        this.isLoading = false;
      },
      error: (err) => this.handleError('Falha ao carregar dados do aluno.')
    });
  }

  // 5. Lógica de Navegação do Wizard
  protected nextStep(): void {
    if (this.currentStep === 1) {
      if (this.dadosPessoais.invalid) {
        this.markGroupAsTouched(this.dadosPessoais); return;
      }
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      if (this.dadosAcademicos.invalid) {
        this.markGroupAsTouched(this.dadosAcademicos); return;
      }
      this.currentStep = 3;
    }
  }

  protected prevStep(): void { this.currentStep--; }
  protected cancel(): void { this.location.back(); }

  // 6. Submissão Final (na Etapa 3)
  protected onSubmit(): void {
    if (this.dadosNaapi.invalid) {
      this.markGroupAsTouched(this.dadosNaapi); return;
    }
    if (this.mainForm.invalid) {
      this.handleError("Formulário inválido. Verifique todas as etapas.");
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const formData = new FormData();

    const alunoData: AlunoInsert = {
      ...this.dadosPessoais.value,
      ...this.dadosAcademicos.value,
      ...this.dadosNaapi.value,
    };
    delete (alunoData as any).fotoFile;

    formData.append('alunoDTO', new Blob([JSON.stringify(alunoData)], {
      type: 'application/json'
    }));

    const fotoFile = this.dadosPessoais.get('fotoFile')?.value;
    if (fotoFile) {
      formData.append('file', fotoFile);
    }

    const saveAction = this.isEditMode
      ? this.alunoService.updateWithFile(this.alunoId!, formData)
      : this.alunoService.createWithFile(formData);

    saveAction.subscribe({
      next: (alunoSalvo: Aluno) => {
        this.isLoading = false;
        this.router.navigate(['/alunos', 'detalhe', alunoSalvo.id]);
      },
      error: (err) => this.handleError(err.error?.message || 'Erro ao salvar aluno.')
    });
  }

  // 7. Lógica para os Checkboxes de Diagnóstico
  onDiagnosticoChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const id = Number(target.value);
    let A_ids: number[] = this.dadosNaapi.get('diagnosticosId')?.value || [];

    if (target.checked) {
      if (!A_ids.includes(id)) A_ids.push(id);
    } else {
      A_ids = A_ids.filter(item => item !== id);
    }
    this.dadosNaapi.get('diagnosticosId')?.setValue(A_ids);
  }

  isChecked(id: number): boolean {
    const A_ids: number[] = this.dadosNaapi.get('diagnosticosId')?.value || [];
    return A_ids.includes(id);
  }

  // 8. Lógica para o Upload de Foto
  onFileChange(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];

      this.dadosPessoais.patchValue({ fotoFile: file });

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // --- Funções Auxiliares ---
  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }
  private markGroupAsTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  get dadosPessoais(): FormGroup { return this.mainForm.get('dadosPessoais') as FormGroup; }
  get dadosAcademicos(): FormGroup { return this.mainForm.get('dadosAcademicos') as FormGroup; }
  get dadosNaapi(): FormGroup { return this.mainForm.get('dadosNaapi') as FormGroup; }
}
