import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Aluno, AlunoInsert, AlunoStatusUpdate } from '../models/aluno.model';

export interface AlunoFilter {
  nome?: string;
  matricula?: string;
  cursoId?: number;
  turmaId?: number;
  diagnosticoId?: number;
}

const API_URL = '/api/alunos';

@Injectable({
  providedIn: 'root'
})
export class AlunoService {

  private http = inject(HttpClient);

  findAll(filters: AlunoFilter = {}): Observable<Aluno[]> {
    let params = new HttpParams();
    if (filters.nome) params = params.set('nome', filters.nome);
    if (filters.matricula) params = params.set('matricula', filters.matricula);
    if (filters.cursoId) params = params.set('cursoId', filters.cursoId.toString());
    if (filters.turmaId) params = params.set('turmaId', filters.turmaId.toString());
    if (filters.diagnosticoId) params = params.set('diagnosticoId', filters.diagnosticoId.toString());
    return this.http.get<Aluno[]>(API_URL, { params });
  }

  findById(id: number): Observable<Aluno> {
    return this.http.get<Aluno>(`${API_URL}/${id}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }

  // --- MÉTODOS ANTIGOS (Mantidos para referência, mas não usados pelo novo form) ---
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

  // --- NOVOS MÉTODOS PARA UPLOAD DE FICHEIRO ---

  /**
   * Cria um novo aluno enviando FormData (DTO + Ficheiro)
   * @param formData O FormData contendo 'alunoDTO' (JSON) e 'file' (Imagem)
   */
  createWithFile(formData: FormData): Observable<Aluno> {
    // Não definimos Content-Type, o navegador faz isso automaticamente para FormData
    return this.http.post<Aluno>(API_URL, formData);
  }

  /**
   * Atualiza um aluno enviando FormData (DTO + Ficheiro)
   * @param id O ID do aluno
   * @param formData O FormData contendo 'alunoDTO' (JSON) e 'file' (Imagem)
   */
  updateWithFile(id: number, formData: FormData): Observable<Aluno> {
    return this.http.put<Aluno>(`${API_URL}/${id}`, formData);
  }
}
