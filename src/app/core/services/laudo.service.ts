// src/app/core/services/laudo.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Laudo } from '../models/laudo.model'; // Importa o novo modelo

const API_URL = '/api/laudos';

@Injectable({ providedIn: 'root' })
export class LaudoService {
  private http = inject(HttpClient);

  /**
   * Busca todos os laudos de um aluno específico.
   * Baseado no endpoint: GET /laudos/aluno/{alunoId}
   */
  findByAlunoId(alunoId: number): Observable<Laudo[]> {
    return this.http.get<Laudo[]>(`${API_URL}/aluno/${alunoId}`);
  }

  // (Aqui podem ser adicionados os métodos create, update, delete no futuro)
}
