import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Curso, Diagnostico, Turma, TipoAtendimento } from '../models/aluno.model';
import { Usuario } from '../models/usuario.model';

// URL base da API (usando o proxy)
const API_URL = '/api';

// --- Interfaces de Relatório ---

// KPI simples (Total)
export interface RelatorioKpiDTO {
  total: number;
}

// DTO Genérico para gráficos (Nome/Valor)
export interface RelatorioGenericoDTO {
  nome: string;
  total: number;
}

// DTO Específico (Alunos por Curso)
export interface RelatorioAlunosPorCursoDTO {
  cursoNome: string;
  totalAlunos: number;
}

// DTO Específico (Alunos por Diagnóstico)
export interface RelatorioAlunosPorDiagnosticoDTO {
  diagnosticoNome: string;
  totalAlunos: number;
}


// --- Serviços ---

@Injectable({ providedIn: 'root' })
export class CursoService {
  constructor(private http: HttpClient) {}
  findAll(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${API_URL}/cursos`);
  }
}

@Injectable({ providedIn: 'root' })
export class TurmaService {
  constructor(private http: HttpClient) {}
  findAll(): Observable<Turma[]> {
    return this.http.get<Turma[]>(`${API_URL}/turmas`);
  }
}

@Injectable({ providedIn: 'root' })
export class DiagnosticoService {
  constructor(private http: HttpClient) {}
  findAll(): Observable<Diagnostico[]> {
    return this.http.get<Diagnostico[]>(`${API_URL}/diagnosticos`);
  }
}

@Injectable({ providedIn: 'root' })
export class TipoAtendimentoService {
  constructor(private http: HttpClient) {}
  findAll(): Observable<TipoAtendimento[]> {
    return this.http.get<TipoAtendimento[]>(`${API_URL}/tipos-atendimento`);
  }
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  constructor(private http: HttpClient) {}
  getMe(): Observable<Usuario> {
    return this.http.get<Usuario>(`${API_URL}/usuarios/me`);
  }
}

// --- Serviço de Relatórios Atualizado ---

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  constructor(private http: HttpClient) {}

  // --- KPIs ---
  // (Endpoint novo: /relatorios/total-alunos-ativos)
  getTotalAlunosAtivos(): Observable<RelatorioKpiDTO> {
    return this.http.get<RelatorioKpiDTO>(`${API_URL}/relatorios/total-alunos-ativos`);
  }

  // (Endpoint novo: /relatorios/total-atendimentos?status=REALIZADO)
  getTotalAtendimentosPorStatus(status: string): Observable<RelatorioKpiDTO> {
    return this.http.get<RelatorioKpiDTO>(`${API_URL}/relatorios/total-atendimentos`, { params: { status } });
  }

  // --- Gráficos ---
  // (Já existente)
  getAlunosPorCurso(): Observable<RelatorioAlunosPorCursoDTO[]> {
    return this.http.get<RelatorioAlunosPorCursoDTO[]>(`${API_URL}/relatorios/alunos-por-curso`);
  }

  // (Já existente)
  getAlunosPorDiagnostico(): Observable<RelatorioAlunosPorDiagnosticoDTO[]> {
    return this.http.get<RelatorioAlunosPorDiagnosticoDTO[]>(`${API_URL}/relatorios/alunos-por-diagnostico`);
  }

  // (Endpoint novo: /relatorios/alunos-por-prioridade)
  getAlunosPorPrioridade(): Observable<RelatorioGenericoDTO[]> {
    return this.http.get<RelatorioGenericoDTO[]>(`${API_URL}/relatorios/alunos-por-prioridade`);
  }

  // (Endpoint novo: /relatorios/atendimentos-por-mes)
  getAtendimentosPorMes(): Observable<RelatorioGenericoDTO[]> {
    // Vamos assumir que o backend filtra por status=REALIZADO
    return this.http.get<RelatorioGenericoDTO[]>(`${API_URL}/relatorios/atendimentos-por-mes`);
  }

  // (Endpoint novo: /relatorios/atendimentos-por-responsavel)
  getAtendimentosPorResponsavel(): Observable<RelatorioGenericoDTO[]> {
    return this.http.get<RelatorioGenericoDTO[]>(`${API_URL}/relatorios/atendimentos-por-responsavel`);
  }
}
