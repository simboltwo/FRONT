/*
 * Arquivo NOVO: simboltwo/front/FRONT-6ada510ac5875a89a10169e7efd5d09b58529961/src/app/layout/toast/toast.component.ts
 * Descrição: O componente que renderiza os toasts na tela.
 */
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Toast, ToastService, ToastType } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  private toastService = inject(ToastService);
  toasts$: Observable<Toast[]> = this.toastService.toasts$;

  removeToast(id: number): void {
    this.toastService.remove(id);
  }

  // --- Funções Auxiliares para Estilo ---

  getToastClass(type: ToastType): string {
    switch (type) {
      case 'success': return 'text-bg-success';
      case 'danger': return 'text-bg-danger';
      case 'warning': return 'text-bg-warning';
      default: return 'text-bg-info';
    }
  }

  getIconClass(type: ToastType): string {
    switch (type) {
      case 'success': return 'bi bi-check-circle-fill';
      case 'danger': return 'bi bi-exclamation-triangle-fill';
      case 'warning': return 'bi bi-exclamation-triangle-fill';
      default: return 'bi bi-info-circle-fill';
    }
  }
}
