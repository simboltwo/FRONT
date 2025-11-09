import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Atendimento, AtendimentoInsert } from '../models/atendimento.model';

const API_URL = '/api/atendimentos';

@Injectable({ providedIn: 'root' })
export class AtendimentoService {
  constructor(private http: HttpClient) {}

  // Baseado no AtendimentoController
  findByAlunoId(alunoId: number): Observable<Atendimento[]> {
    return this.http.get<Atendimento[]>(`${API_URL}/aluno/${alunoId}`);
  }

  create(atendimento: AtendimentoInsert): Observable<Atendimento> {
    return this.http.post<Atendimento>(API_URL, atendimento);
  }

  // Update e Delete podem ser adicionados conforme a necessidade
}
