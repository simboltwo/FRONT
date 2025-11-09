// Baseado em AlunoInsertDTO.java e AlunoDTO.java
export interface Aluno {
  id: number;
  nome: string;
  nomeSocial?: string;
  matricula: string;
  foto?: string;
  prioridadeAtendimento: boolean;
  ativo: boolean;
  curso: Curso;
  turma: Turma;
  diagnosticos: Diagnostico[];
}

export interface AlunoInsert {
  nome: string;
  nomeSocial?: string;
  matricula: string;
  foto?: string;
  prioridadeAtendimento: boolean;
  cursoId: number;
  turmaId: number;
  diagnosticosId?: number[];
}

// Interfaces auxiliares
export interface Curso {
  id: number;
  nome: string;
}

export interface Turma {
  id: number;
  nome: string;
}

export interface Diagnostico {
  id: number;
  nome: string;
  cid?: string;
  sigla?: string;
}

export interface TipoAtendimento {
  id: number;
  nome: string;
}
