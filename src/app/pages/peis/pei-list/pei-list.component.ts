import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pei-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center text-muted p-4">
      <i class="bi bi-clipboard2-data fs-2"></i>
      <p>A secção de PEI (Plano Educacional Individualizado) será implementada aqui.</p>
      <p>(Aluno ID: {{ alunoId }})</p>
    </div>
  `
})
export class PeiList {
  @Input() alunoId!: number;
}
