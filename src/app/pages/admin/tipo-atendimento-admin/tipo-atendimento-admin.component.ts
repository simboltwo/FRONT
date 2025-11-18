// src/app/pages/admin/tipo-atendimento-admin/tipo-atendimento-admin.component.ts
import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, switchMap, tap, finalize, combineLatest, startWith, map } from 'rxjs';
import { TipoAtendimento } from '../../../core/models/aluno.model';
import { TipoAtendimentoService } from '../../../core/services/api.service';

@Component({
  selector: 'app-tipo-atendimento-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tipo-atendimento-admin.component.html',
  styleUrls: ['./tipo-atendimento-admin.component.scss']
})
export class TipoAtendimentoAdminComponent implements OnInit {

  private fb = inject(FormBuilder);
  private tipoAtendimentoService = inject(TipoAtendimentoService);

  @ViewChild('formCard') private formCard!: ElementRef;

  public tiposAtendimento$!: Observable<TipoAtendimento[]>;
  public crudForm: FormGroup;

  public isLoading = false;
  public itemSearch = new FormControl('');
  public isMobileFormVisible = false;

  protected isEditMode = false;
  protected selectedId: number | null = null;
  protected errorMessage: string | null = null;

  private refresh$ = new BehaviorSubject<void>(undefined);
  private allItems$!: Observable<TipoAtendimento[]>;

  constructor() {
    this.crudForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]]
    });
  }

  ngOnInit(): void {
    this.allItems$ = this.refresh$.pipe(
      switchMap(() => this.tipoAtendimentoService.findAll()),
      tap(list => list.sort((a, b) => a.nome.localeCompare(b.nome)))
    );

    this.tiposAtendimento$ = combineLatest([
      this.allItems$,
      this.itemSearch.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([items, searchTerm]) => {
        const filter = (searchTerm || '').toLowerCase().trim();
        if (!filter) return items;
        return items.filter(item =>
          item.nome.toLowerCase().includes(filter)
        );
      })
    );
  }

  protected selectItem(item: TipoAtendimento): void {
    this.isEditMode = true;
    this.selectedId = item.id;
    this.crudForm.patchValue({
      nome: item.nome
    });
    this.errorMessage = null;
    this.isMobileFormVisible = true;
    this.scrollToFormOnMobile();
  }

  protected clearForm(): void {
    this.isEditMode = false;
    this.selectedId = null;
    this.crudForm.reset({ nome: '' });
    this.errorMessage = null;
    this.isMobileFormVisible = false;
  }

  protected onNewClick(): void {
    this.clearForm();
    this.isMobileFormVisible = true;
    setTimeout(() => this.scrollToFormOnMobile(), 0);
  }

  protected onSubmit(): void {
    if (this.crudForm.invalid || this.isLoading) return;

    this.errorMessage = null;
    this.isLoading = true;

    const data = this.crudForm.value;
    const save$: Observable<TipoAtendimento> = this.isEditMode
      ? this.tipoAtendimentoService.update(this.selectedId!, data)
      : this.tipoAtendimentoService.create(data);

    save$.pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.clearForm();
        this.refresh$.next();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao salvar o tipo de atendimento.';
      }
    });
  }

  protected onDelete(): void {
    if (!this.isEditMode || !this.selectedId || this.isLoading) return;

    if (confirm('Tem certeza que deseja excluir este tipo de atendimento? Esta ação não pode ser desfeita.')) {
      this.isLoading = true;
      this.errorMessage = null;

      this.tipoAtendimentoService.delete(this.selectedId).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this.clearForm();
          this.refresh$.next();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erro ao excluir. Este item pode estar em uso por um atendimento.';
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
}
