import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Aluno, AlunoInsert } from '../models/aluno.model';

/**
 * Interface para os filtros de busca de alunos,
 * baseada nos @RequestParams do AlunoController.java.
 */
export interface AlunoFilter {
  nome?: string;
  matricula?: string;
  cursoId?: number;
  turmaId?: number;
  diagnosticoId?: number;
}

/**
 * URL base da API para Alunos.
 * Estamos usando '/api/alunos' por causa do proxy (proxy.conf.json)
 * que redireciona para http://localhost:8080/alunos.
 */
const API_URL = '/api/alunos';

/**
 * Serviço responsável por toda a comunicação com a API
 * referente à entidade Aluno.
 */
@Injectable({
  providedIn: 'root'
})
export class AlunoService {

  // Injeta o HttpClient para fazer as requisições
  private http = inject(HttpClient);

  /**
   * Documentação:
   * Busca uma lista de alunos.
   * Suporta filtros opcionais conforme definido no AlunoController.
   *
   * @param filters - Um objeto contendo os filtros (nome, matricula, etc.)
   * @returns Um Observable com a lista de Alunos (AlunoDTO)
   */
  findAll(filters: AlunoFilter = {}): Observable<Aluno[]> {

    // Constrói os parâmetros de query (HttpParams)
    let params = new HttpParams();

    // Adiciona os filtros se eles existirem
    if (filters.nome) {
      params = params.set('nome', filters.nome);
    }
    if (filters.matricula) {
      params = params.set('matricula', filters.matricula);
    }
    if (filters.cursoId) {
      params = params.set('cursoId', filters.cursoId.toString());
    }
    if (filters.turmaId) {
      params = params.set('turmaId', filters.turmaId.toString());
    }
    if (filters.diagnosticoId) {
      params = params.set('diagnosticoId', filters.diagnosticoId.toString());
    }

    // Faz a chamada GET para /api/alunos?nome=...&matricula=...
    return this.http.get<Aluno[]>(API_URL, { params });
  }

  /**
   * Documentação:
   * Busca um único aluno pelo seu ID.
   * Mapeia o endpoint: @GetMapping("/{id}")
   *
   * @param id - O ID do aluno a ser buscado.
   * @returns Um Observable com o Aluno (AlunoDTO)
   */
  findById(id: number): Observable<Aluno> {
    return this.http.get<Aluno>(`${API_URL}/${id}`);
  }

  /**
   * Documentação:
   * Cria um novo aluno.
   * Mapeia o endpoint: @PostMapping
   *
   * @param aluno - O objeto AlunoInsert (baseado no AlunoInsertDTO)
   * @returns Um Observable com o Aluno criado (AlunoDTO)
   */
  create(aluno: AlunoInsert): Observable<Aluno> {
    return this.http.post<Aluno>(API_URL, aluno);
  }

  /**
   * Documentação:
   * Atualiza um aluno existente.
   * Mapeia o endpoint: @PutMapping("/{id}")
   *
   * @param id - O ID do aluno a ser atualizado.
   * @param aluno - O objeto AlunoInsert com os dados atualizados (baseado no AlunoInsertDTO)
   * @returns Um Observable com o Aluno atualizado (AlunoDTO)
   */
  update(id: number, aluno: AlunoInsert): Observable<Aluno> {
    return this.http.put<Aluno>(`${API_URL}/${id}`, aluno);
  }

  /**
   * Documentação:
   * Deleta (inativa) um aluno.
   * Mapeia o endpoint: @DeleteMapping("/{id}")
   *
   * @param id - O ID do aluno a ser deletado.
   * @returns Um Observable<void> (sem conteúdo)
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
