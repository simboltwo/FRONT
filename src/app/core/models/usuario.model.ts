import { Turma } from './aluno.model';
export interface Papel {
  id: number;
  authority: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papeis: Papel[];
  turmasLecionadas: Turma[];
}

export interface UsuarioInsert {
  nome: string;
  email: string;
  senha?: string;
  papeis: number[];
}

export interface UsuarioUpdate {
  nome: string;
  email: string;
  papeis: number[];
}

export interface UsuarioSelfUpdate {
  nome: string;
  email: string;
}

export interface UsuarioPasswordUpdate {
  senhaAtual: string;
  novaSenha: string;
  confirmacaoNovaSenha: string;
}
