// src/app/core/services/api.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Curso, Diagnostico, Turma, TipoAtendimento } from '../models/aluno.model';
import { Papel, Usuario, UsuarioInsert, UsuarioUpdate, UsuarioSelfUpdate, UsuarioPasswordUpdate } from '../models/usuario.model';
import { Aluno } from '../models/aluno.model';

// URL base da API (usando o proxy)
const API_URL = '/api';

export interface RelatorioAlunosPorCursoDTO {
  cursoNome: string;
  totalAlunos: number;
}
export interface RelatorioAlunosPorDiagnosticoDTO {
  diagnosticoNome: string;
  totalAlunos: number;
}
export interface RelatorioKpiDTO {
  total: number;
}

// =======================================================
// MUDANÇA: Adicionados métodos create, update, delete
// =======================================================

@Injectable({ providedIn: 'root' })
export class CursoService {
  private url = `${API_URL}/cursos`;
  constructor(private http: HttpClient) {}
  findAll(): Observable<Curso[]> { return this.http.get<Curso[]>(this.url); }
  create(data: { nome: string }): Observable<Curso> { return this.http.post<Curso>(this.url, data); }
  update(id: number, data: { nome: string }): Observable<Curso> { return this.http.put<Curso>(`${this.url}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class TurmaService {
  private url = `${API_URL}/turmas`;
  constructor(private http: HttpClient) {}
  findAll(): Observable<Turma[]> { return this.http.get<Turma[]>(this.url); }
  create(data: { nome: string }): Observable<Turma> { return this.http.post<Turma>(this.url, data); }
  update(id: number, data: { nome: string }): Observable<Turma> { return this.http.put<Turma>(`${this.url}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class DiagnosticoService {
  private url = `${API_URL}/diagnosticos`;
  constructor(private http: HttpClient) {}
  findAll(): Observable<Diagnostico[]> { return this.http.get<Diagnostico[]>(this.url); }
  // O DTO do Diagnóstico é mais complexo
  create(data: Partial<Diagnostico>): Observable<Diagnostico> { return this.http.post<Diagnostico>(this.url, data); }
  update(id: number, data: Partial<Diagnostico>): Observable<Diagnostico> { return this.http.put<Diagnostico>(`${this.url}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class TipoAtendimentoService {
  private url = `${API_URL}/tipos-atendimento`;
  constructor(private http: HttpClient) {}
  findAll(): Observable<TipoAtendimento[]> { return this.http.get<TipoAtendimento[]>(this.url); }
  create(data: { nome: string }): Observable<TipoAtendimento> { return this.http.post<TipoAtendimento>(this.url, data); }
  update(id: number, data: { nome: string }): Observable<TipoAtendimento> { return this.http.put<TipoAtendimento>(`${this.url}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}

// =======================================================
// (O restante dos serviços não precisa de alteração)
// =======================================================

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private url = `${API_URL}/usuarios`;
  constructor(private http: HttpClient) {}

  // Busca o usuário logado
  getMe(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.url}/me`);
  }

  updateSelfDetails(data: UsuarioSelfUpdate): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/me/detalhes`, data);
  }

  updateSelfPassword(data: UsuarioPasswordUpdate): Observable<void> {
    return this.http.put<void>(`${this.url}/me/senha`, data);
  }

  // Métodos CRUD para o admin
  findAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }
  create(data: UsuarioInsert): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, data);
  }
  update(id: number, data: UsuarioUpdate): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}`, data);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  constructor(private http: HttpClient) {}

  getAlunosPorCurso(): Observable<RelatorioAlunosPorCursoDTO[]> {
    return this.http.get<RelatorioAlunosPorCursoDTO[]>(`${API_URL}/relatorios/alunos-por-curso`);
  }
  getAlunosPorDiagnostico(): Observable<RelatorioAlunosPorDiagnosticoDTO[]> {
    return this.http.get<RelatorioAlunosPorDiagnosticoDTO[]>(`${API_URL}/relatorios/alunos-por-diagnostico`);
  }
  getTotalAtendimentosPorStatus(status: 'AGENDADO' | 'REALIZADO'): Observable<RelatorioKpiDTO> {
    return this.http.get<RelatorioKpiDTO>(`${API_URL}/relatorios/total-atendimentos`, {
      params: { status: status }
    });
  }

  exportarAlunosPorCursoCSV(): Observable<string> {
    return this.http.get(`${API_URL}/relatorios/alunos-por-curso/csv`, {
      responseType: 'text' // Diz ao Angular para esperar uma string, não JSON
    });
  }

  /**
   * Busca os dados do relatório de Diagnósticos como uma string CSV.
   * Baseado no endpoint: GET /relatorios/alunos-por-diagnostico/csv
   */
  exportarAlunosPorDiagnosticoCSV(): Observable<string> {
    return this.http.get(`${API_URL}/relatorios/alunos-por-diagnostico/csv`, {
      responseType: 'text'
    });
  }
}

@Injectable({ providedIn: 'root' })
export class PapelService {
  private url = `${API_URL}/papeis`; // Assumindo que o endpoint de papéis é /papeis
  constructor(private http: HttpClient) {}
  findAll(): Observable<Papel[]> { return this.http.get<Papel[]>(this.url); }
}



