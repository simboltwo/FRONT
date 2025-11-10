// atendimento-form.component.ts
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AtendimentoService } from '../../../core/services/atendimento.service';
import { TipoAtendimentoService, UsuarioService } from '../../../core/services/api.service';
import { TipoAtendimento } from '../../../core/models/aluno.model';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-atendimento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],

  // MUDANÇA: Aponta para o HTML externo
  templateUrl: './atendimento-form.component.html',
  styleUrls: ['./atendimento-form.component.scss']
})
export class AtendimentoForm implements OnInit {
  @Input() alunoId!: number;
  @Output() atendimentoSalvo = new EventEmitter<void>();

  protected atendimentoForm!: FormGroup;
  protected tiposAtendimento$!: Observable<TipoAtendimento[]>;
  protected usuarioLogado!: Usuario;
  protected isLoading = false;
  protected errorMessage: string | null = null;

  private fb = inject(FormBuilder);
  private atendimentoService = inject(AtendimentoService);
  private tipoAtendimentoService = inject(TipoAtendimentoService);
  private usuarioService = inject(UsuarioService);

  ngOnInit(): void {
    if (!this.alunoId) {
      this.errorMessage = "Erro: ID do Aluno não fornecido.";
      return;
    }

    this.usuarioService.getMe().subscribe(user => {
      this.usuarioLogado = user;
    });

    this.tiposAtendimento$ = this.tipoAtendimentoService.findAll();

    this.atendimentoForm = this.fb.group({
      dataHora: ['', [Validators.required]],
      descricao: ['', [Validators.required, Validators.minLength(5)]],
      status: ['AGENDADO', [Validators.required]],
      tipoAtendimentoId: [null, [Validators.required]]
    });
  }

  get form() { return this.atendimentoForm; }

  onSubmit(): void {
    if (this.atendimentoForm.invalid || !this.usuarioLogado) {
      this.errorMessage = "Formulário inválido. Verifique todos os campos.";
      this.atendimentoForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const payload = {
      ...this.atendimentoForm.value,
      alunoId: this.alunoId,
      responsavelId: this.usuarioLogado.id
    };

    this.atendimentoService.create(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.atendimentoForm.reset({
          status: 'AGENDADO',
          tipoAtendimentoId: null
        });
        this.atendimentoSalvo.emit();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Erro ao salvar atendimento.";
        this.isLoading = false;
      }
    });
  }
}
