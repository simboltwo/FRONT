import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HistoricoAcademico, HistoricoAcademicoInsert } from '../models/historico-academico.model';

const API_URL = '/api/historico-academico';

@Injectable({ providedIn: 'root' })
export class HistoricoAcademicoService {
  private http = inject(HttpClient);

  findByAlunoId(alunoId: number): Observable<HistoricoAcademico[]> {
    return this.http.get<HistoricoAcademico[]>(`${API_URL}/aluno/${alunoId}`);
  }

  create(historico: HistoricoAcademicoInsert): Observable<HistoricoAcademico> {
    return this.http.post<HistoricoAcademico>(API_URL, historico);
  }

  update(id: number, historico: HistoricoAcademicoInsert): Observable<HistoricoAcademico> {
    return this.http.put<HistoricoAcademico>(`${API_URL}/${id}`, historico);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
