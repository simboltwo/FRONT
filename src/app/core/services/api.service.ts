import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Curso, Diagnostico, Turma, TipoAtendimento } from '../models/aluno.model';
import { Usuario } from '../models/usuario.model';
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
    return this.http.get<TipoAtendimento[]>(`/api/tipos-atendimento`);
  }
}
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  constructor(private http: HttpClient) {}
  // Busca o usuário logado
  getMe(): Observable<Usuario> {
    return this.http.get<Usuario>(`${API_URL}/usuarios/me`);
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
}
