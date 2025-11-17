// src/app/core/services/pei.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
// --- MUDANÇA: Importar PeiInsert ---
import { PEI, PeiInsert } from '../models/pei.model';

const API_URL = '/api/peis';

@Injectable({ providedIn: 'root' })
export class PeiService {
  private http = inject(HttpClient);

  findByAlunoId(alunoId: number): Observable<PEI[]> {
    return this.http.get<PEI[]>(`${API_URL}/aluno/${alunoId}`);
  }

  // --- NOVO: Método para criar um PEI ---
  // Baseado no PeiInsertDTO.java
  create(pei: PeiInsert): Observable<PEI> {
    return this.http.post<PEI>(API_URL, pei);
  }
}
