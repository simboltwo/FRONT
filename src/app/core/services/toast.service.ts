/*
 * Arquivo NOVO: simboltwo/front/FRONT-6ada510ac5875a89a10169e7efd5d09b58529961/src/app/core/services/toast.service.ts
 * Descrição: Serviço central para gerenciar notificações "toast".
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Define os tipos de toast que podemos exibir
export type ToastType = 'success' | 'danger' | 'warning' | 'info';

// Define a estrutura de um objeto Toast
export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number; // Duração em ms
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastId = 0;
  private toastSubject = new BehaviorSubject<Toast[]>([]);

  // O componente de toast irá se inscrever neste Observable
  public toasts$: Observable<Toast[]> = this.toastSubject.asObservable();

  /**
   * Exibe um novo toast.
   * @param message A mensagem a ser exibida.
   * @param type O tipo de toast (success, danger, etc.).
   * @param duration Por quanto tempo o toast deve ficar na tela.
   */
  show(message: string, type: ToastType = 'info', duration: number = 5000): void {
    const id = this.toastId++;
    const newToast: Toast = { id, message, type, duration };

    // Adiciona o novo toast à lista
    const currentToasts = this.toastSubject.getValue();
    this.toastSubject.next([...currentToasts, newToast]);

    // Define um timeout para remover o toast automaticamente
    setTimeout(() => this.remove(id), duration);
  }

  /**
   * Remove um toast da tela (chamado pelo timeout ou pelo botão 'fechar').
   * @param id O ID do toast a ser removido.
   */
  remove(id: number): void {
    const currentToasts = this.toastSubject.getValue();
    this.toastSubject.next(currentToasts.filter(toast => toast.id !== id));
  }
}
