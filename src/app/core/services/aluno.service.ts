import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Aluno, AlunoInsert, AlunoStatusUpdate } from '../models/aluno.model';

export interface AlunoFilter {
  nome?: string;
  matricula?: string;
  cursoIds?: number[];
  turmaId?: number;
  diagnosticoIds?: number[];
  atendimentoData?: string;
  atendimentoStatus?: string;
  turmasLecionadasId?: number[];
}

const API_URL = '/api/alunos';

@Injectable({
  providedIn: 'root'
})
export class AlunoService {

  private http = inject(HttpClient);

  findAll(filters: AlunoFilter = {}): Observable<Aluno[]> {
    let params = new HttpParams();

    if (filters.nome) {
      params = params.set('nome', filters.nome);
    }
    if (filters.matricula) {
      params = params.set('matricula', filters.matricula);
    }
    if (filters.turmaId) {
      params = params.set('turmaId', filters.turmaId.toString());
    }

    if (filters.cursoIds && filters.cursoIds.length > 0) {
      filters.cursoIds.forEach(id => {
        params = params.append('cursoId', id.toString());
      });
    }
    if (filters.diagnosticoIds && filters.diagnosticoIds.length > 0) {
      filters.diagnosticoIds.forEach(id => {
        params = params.append('diagnosticoId', id.toString());
      });
    }
    if (filters.atendimentoData) {
      params = params.set('atendimentoData', filters.atendimentoData);
    }
    if (filters.atendimentoStatus) {
      params = params.set('atendimentoStatus', filters.atendimentoStatus);
    }
    if (filters.turmasLecionadasId && filters.turmasLecionadasId.length > 0) {
      filters.turmasLecionadasId.forEach(id => {
        params = params.append('turmasLecionadasId', id.toString());
      });
    }

    return this.http.get<Aluno[]>(API_URL, { params });
  }

  findById(id: number): Observable<Aluno> {
    return this.http.get<Aluno>(`${API_URL}/${id}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }

  create(aluno: AlunoInsert): Observable<Aluno> {
    console.warn('O método "create" está obsoleto. Use "createWithFile".');
    return this.http.post<Aluno>(API_URL, aluno);
  }
  update(id: number, aluno: AlunoInsert): Observable<Aluno> {
    console.warn('O método "update" está obsoleto. Use "updateWithFile".');
    return this.http.put<Aluno>(`${API_URL}/${id}`, aluno);
  }

  updateStatus(id: number, data: AlunoStatusUpdate): Observable<Aluno> {
    return this.http.patch<Aluno>(`${API_URL}/${id}/status`, data);
  }


  /**
   * @param formData
   */
  createWithFile(formData: FormData): Observable<Aluno> {
    return this.http.post<Aluno>(API_URL, formData);
  }

  /**
   * @param id
   * @param formData
   */
  updateWithFile(id: number, formData: FormData): Observable<Aluno> {
    return this.http.put<Aluno>(`${API_URL}/${id}`, formData);
  }
}
