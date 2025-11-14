import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-laudo-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center text-muted p-4">
      <i class="bi bi-file-earmark-medical fs-2"></i>
      <p>A seção de Laudos ainda não foi implementada.</p>
    </div>
  `
})
export class LaudoList {
  @Input() alunoId!: number;
}
