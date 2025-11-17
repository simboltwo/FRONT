// src/app/core/services/laudo.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Laudo } from '../models/laudo.model';

const API_URL = '/api/laudos';

@Injectable({ providedIn: 'root' })
export class LaudoService {
  private http = inject(HttpClient);

  findByAlunoId(alunoId: number): Observable<Laudo[]> {
    return this.http.get<Laudo[]>(`${API_URL}/aluno/${alunoId}`);
  }

  // --- NOVO: Método para criar com upload ---
  createWithFile(formData: FormData): Observable<Laudo> {
    return this.http.post<Laudo>(API_URL, formData);
  }

  // --- NOVO: Método para deletar ---
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
