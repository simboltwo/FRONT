// src/app/pages/admin/usuario-admin/usuario-admin.component.ts
import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, switchMap, tap, finalize, forkJoin, combineLatest, startWith, map } from 'rxjs';
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
  private papelService = inject(PapelService);

  @ViewChild('formCard') private formCard!: ElementRef;

  public usuarios$!: Observable<Usuario[]>;
  public papeis$!: Observable<Papel[]>;
  public crudForm: FormGroup;

  public isLoading = false;
  public userSearch = new FormControl('');
  public isMobileFormVisible = false;

  protected isEditMode = false;
  protected selectedUsuarioId: number | null = null;
  protected errorMessage: string | null = null;

  private refresh$ = new BehaviorSubject<void>(undefined);
  private allUsers$!: Observable<Usuario[]>;

  constructor() {
    this.crudForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.minLength(6), Validators.maxLength(20)]],
      papeis: this.fb.control<number[]>([], [Validators.required, Validators.minLength(1)])
    });
  }

  ngOnInit(): void {
    this.allUsers$ = this.refresh$.pipe(
      switchMap(() => this.usuarioService.findAll()),
      tap(list => list.sort((a, b) => a.nome.localeCompare(b.nome)))
    );

    this.usuarios$ = combineLatest([
      this.allUsers$,
      this.userSearch.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([users, searchTerm]) => {
        const filter = (searchTerm || '').toLowerCase().trim();
        if (!filter) return users;
        return users.filter(user =>
          user.nome.toLowerCase().includes(filter) ||
          user.email.toLowerCase().includes(filter)
        );
      })
    );

    this.papeis$ = this.papelService.findAll();
  }

  protected selectUsuario(usuario: Usuario): void {
    this.isEditMode = true;
    this.selectedUsuarioId = usuario.id;

    this.crudForm.get('senha')?.clearValidators();
    this.crudForm.get('senha')?.updateValueAndValidity();

    this.crudForm.patchValue({
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      papeis: usuario.papeis.map(p => p.id)
    });
    this.errorMessage = null;
    this.isMobileFormVisible = true;
    this.scrollToFormOnMobile();
  }

  protected clearForm(): void {
    this.isEditMode = false;
    this.selectedUsuarioId = null;

    this.crudForm.get('senha')?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(20)]);
    this.crudForm.get('senha')?.updateValueAndValidity();

    this.crudForm.reset({
      nome: '', email: '', senha: '', papeis: []
    });
    this.errorMessage = null;
    this.isMobileFormVisible = false;
  }

  protected onNewClick(): void {
    this.clearForm();
    this.isMobileFormVisible = true;
    setTimeout(() => this.scrollToFormOnMobile(), 0);
  }

  protected onSubmit(): void {
    if (this.crudForm.invalid) {
      this.errorMessage = "Formulário inválido. Verifique os campos (Nome, Email, Senha e pelo menos um Papel).";
      return;
    }
    if (this.isLoading) return;

    this.errorMessage = null;
    this.isLoading = true;

    let save$: Observable<Usuario>;

    if (this.isEditMode) {
      const data: UsuarioUpdate = {
        nome: this.crudForm.value.nome,
        email: this.crudForm.value.email,
        papeis: this.crudForm.value.papeis
      };
      save$ = this.usuarioService.update(this.selectedUsuarioId!, data);
    } else {
      const data: UsuarioInsert = this.crudForm.value;
      save$ = this.usuarioService.create(data);
    }

    save$.pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
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
    if (!this.isEditMode || !this.selectedUsuarioId || this.isLoading) return;

    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      this.isLoading = true;
      this.errorMessage = null;

      this.usuarioService.delete(this.selectedUsuarioId).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
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

  private scrollToFormOnMobile(): void {
    if (window.innerWidth < 992 && this.formCard) {
      this.formCard.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
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
