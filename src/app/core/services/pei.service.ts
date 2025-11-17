// src/app/core/services/pei.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PEI } from '../models/pei.model'; // Importa o novo modelo

const API_URL = '/api/peis';

@Injectable({ providedIn: 'root' })
export class PeiService {
  private http = inject(HttpClient);

  /**
   * Busca todos os PEIs de um aluno específico.
   * Baseado no endpoint: GET /peis/aluno/{alunoId}
   */
  findByAlunoId(alunoId: number): Observable<PEI[]> {
    return this.http.get<PEI[]>(`${API_URL}/aluno/${alunoId}`);
  }

  // (Aqui podem ser adicionados os métodos create, update, delete no futuro)
}
