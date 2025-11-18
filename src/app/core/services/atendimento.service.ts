/*
 * Arquivo: simboltwo/front/FRONT-6ada510ac5875a89a10169e7efd5d09b58529961/src/app/core/services/atendimento.service.ts
 * Descrição: 'findMyAtendimentos' atualizado, 'concluirAtendimento' adicionado.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Atendimento, AtendimentoConclusao, AtendimentoInsert } from '../models/atendimento.model'; // --- MUDANÇA ---

const API_URL = '/api/atendimentos';

@Injectable({ providedIn: 'root' })
export class AtendimentoService {
  constructor(private http: HttpClient) {}

  findByAlunoId(alunoId: number, status: string | null = null): Observable<Atendimento[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<Atendimento[]>(`${API_URL}/aluno/${alunoId}`, { params });
  }

  findById(id: number): Observable<Atendimento> {
    return this.http.get<Atendimento>(`${API_URL}/${id}`);
  }

  // --- INÍCIO DA MUDANÇA (Filtro) ---
  findMyAtendimentos(alunoNome: string | null = null): Observable<Atendimento[]> {
    let params = new HttpParams();
    if (alunoNome) {
      params = params.set('alunoNome', alunoNome);
    }
    return this.http.get<Atendimento[]>(`${API_URL}/me`, { params });
  }
  // --- FIM DA MUDANÇA ---

  create(atendimento: AtendimentoInsert): Observable<Atendimento> {
    return this.http.post<Atendimento>(API_URL, atendimento);
  }

  update(id: number, atendimento: AtendimentoInsert): Observable<Atendimento> {
    return this.http.put<Atendimento>(`${API_URL}/${id}`, atendimento);
  }

  // --- INÍCIO DA MUDANÇA (Modal) ---
  /**
   * Conclui ou cancela um atendimento (usando o DTO leve).
   */
  concluirAtendimento(id: number, conclusao: AtendimentoConclusao): Observable<Atendimento> {
    return this.http.patch<Atendimento>(`${API_URL}/${id}/status`, conclusao);
  }
  // --- FIM DA MUDANÇA ---
}
