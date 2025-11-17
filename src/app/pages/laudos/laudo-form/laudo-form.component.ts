import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LaudoService } from '../../../core/services/laudo.service';
import { Laudo } from '../../../core/models/laudo.model';

@Component({
  selector: 'app-laudo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './laudo-form.component.html',
  styleUrls: ['./laudo-form.component.scss']
})
export class LaudoForm implements OnInit {
  @Input() alunoId!: number;
  @Output() laudoSalvo = new EventEmitter<void>();

  protected laudoForm!: FormGroup;
  protected isLoading = false;
  protected errorMessage: string | null = null;
  protected selectedFileName: string | null = null;

  private fb = inject(FormBuilder);
  private laudoService = inject(LaudoService);

  ngOnInit(): void {
    if (!this.alunoId) {
      this.errorMessage = "Erro: ID do Aluno não fornecido.";
      return;
    }

    this.laudoForm = this.fb.group({
      dataEmissao: [''],
      descricao: [''],
      file: [null, [Validators.required]] // O validador do arquivo
    });
  }

  get form() { return this.laudoForm; }

  onFileChange(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      this.laudoForm.patchValue({ file: file });
      this.selectedFileName = file.name;
    } else {
      this.laudoForm.patchValue({ file: null });
      this.selectedFileName = null;
    }
  }

  onSubmit(): void {
    if (this.laudoForm.invalid) {
      this.errorMessage = "Formulário inválido. O arquivo PDF é obrigatório.";
      this.laudoForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const formData = new FormData();
    const formValue = this.laudoForm.value;

    // 1. Cria o DTO JSON
    const laudoDTO = {
      alunoId: this.alunoId,
      dataEmissao: formValue.dataEmissao || null,
      descricao: formValue.descricao || ''
    };

    // 2. Adiciona o DTO como string
    formData.append('laudoDTO', new Blob([JSON.stringify(laudoDTO)], {
      type: 'application/json'
    }));

    // 3. Adiciona o arquivo
    formData.append('file', formValue.file);

    this.laudoService.createWithFile(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.laudoForm.reset();
        this.selectedFileName = null;
        this.laudoSalvo.emit();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Erro ao salvar laudo. Verifique o tamanho do arquivo.";
        this.isLoading = false;
      }
    });
  }
}
