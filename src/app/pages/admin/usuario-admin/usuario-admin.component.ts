// src/app/pages/admin/usuario-admin/usuario-admin.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, switchMap, tap, forkJoin } from 'rxjs';
import { Usuario, Papel, UsuarioInsert, UsuarioUpdate } from '../../../core/models/usuario.model';
import { UsuarioService, PapelService } from '../../../core/services/api.service';

@Component({
  selector: 'app-usuario-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-admin.component.html',
  styleUrls: ['./usuario-admin.component.scss']
})
export class UsuarioAdminComponent implements OnInit {

  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private papelService = inject(PapelService); // Serviço para buscar os papéis

  protected usuarios$!: Observable<Usuario[]>;
  protected papeis$!: Observable<Papel[]>; // Observable para os papéis
  protected crudForm: FormGroup;

  protected isEditMode = false;
  protected selectedUsuarioId: number | null = null;
  protected errorMessage: string | null = null;

  private refresh$ = new BehaviorSubject<void>(undefined);

  constructor() {
    this.crudForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      // Senha só é obrigatória na criação (isEditMode = false)
      senha: ['', [Validators.minLength(6), Validators.maxLength(20)]],
      // Para os checkboxes de papéis
      papeis: this.fb.control<number[]>([], [Validators.required, Validators.minLength(1)])
    });
  }

  ngOnInit(): void {
    // Carrega os usuários
    this.usuarios$ = this.refresh$.pipe(
      switchMap(() => this.usuarioService.findAll()),
      tap(list => list.sort((a, b) => a.nome.localeCompare(b.nome)))
    );
    // Carrega os papéis (para os checkboxes)
    this.papeis$ = this.papelService.findAll();
  }

  protected selectUsuario(usuario: Usuario): void {
    this.isEditMode = true;
    this.selectedUsuarioId = usuario.id;

    // Adiciona/Remove a validação 'required' da senha
    this.crudForm.get('senha')?.clearValidators();
    this.crudForm.get('senha')?.updateValueAndValidity();

    this.crudForm.patchValue({
      nome: usuario.nome,
      email: usuario.email,
      senha: '', // Limpa o campo senha
      papeis: usuario.papeis.map(p => p.id) // Seta os IDs dos papéis
    });
    this.errorMessage = null;
  }

  protected clearForm(): void {
    this.isEditMode = false;
    this.selectedUsuarioId = null;

    // Adiciona a validação 'required' da senha
    this.crudForm.get('senha')?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(20)]);
    this.crudForm.get('senha')?.updateValueAndValidity();

    this.crudForm.reset({
      nome: '', email: '', senha: '', papeis: []
    });
    this.errorMessage = null;
  }

  protected onSubmit(): void {
    if (this.crudForm.invalid) {
      this.errorMessage = "Formulário inválido. Verifique os campos.";
      return;
    }
    this.errorMessage = null;

    let save$: Observable<Usuario>;

    if (this.isEditMode) {
      // Modo Edição (UsuarioUpdateDTO)
      const data: UsuarioUpdate = {
        nome: this.crudForm.value.nome,
        email: this.crudForm.value.email,
        papeis: this.crudForm.value.papeis
      };
      save$ = this.usuarioService.update(this.selectedUsuarioId!, data);
    } else {
      // Modo Criação (UsuarioInsertDTO)
      const data: UsuarioInsert = this.crudForm.value;
      save$ = this.usuarioService.create(data);
    }

    save$.subscribe({
      next: () => {
        this.clearForm();
        this.refresh$.next();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao salvar usuário.';
      }
    });
  }

  protected onDelete(): void {
    if (!this.isEditMode || !this.selectedUsuarioId) return;

    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      this.usuarioService.delete(this.selectedUsuarioId).subscribe({
        next: () => {
          this.clearForm();
          this.refresh$.next();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erro ao excluir usuário.';
        }
      });
    }
  }

  // --- Funções para Checkbox de Papéis ---
  onPapelChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const id = Number(target.value);
    let A_ids: number[] = this.crudForm.get('papeis')?.value || [];

    if (target.checked) {
      if (!A_ids.includes(id)) A_ids.push(id);
    } else {
      A_ids = A_ids.filter(item => item !== id);
    }
    this.crudForm.get('papeis')?.setValue(A_ids);
  }

  isPapelChecked(id: number): boolean {
    const A_ids: number[] = this.crudForm.get('papeis')?.value || [];
    return A_ids.includes(id);
  }
}
