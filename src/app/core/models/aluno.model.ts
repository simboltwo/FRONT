import { Time } from "@angular/common";

// Interfaces auxiliares (Curso, Turma, Diagnostico)
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

// --- INTERFACE ALUNO (DTO) ATUALIZADA ---
// Esta interface agora reflete o Aluno.java e o AlunoDTO
export interface Aluno {
  id: number;
  nome: string;
  nomeSocial?: string;
  matricula: string;
  foto?: string;
  ativo: boolean;

  // --- CAMPOS ATUALIZADOS E NOVOS ---
  prioridade: string; // Era prioridadeAtendimento: boolean
  dataNascimento?: Date;
  cpf?: string;
  telefoneEstudante?: string;
  provaOutroEspaco?: boolean;
  processoSipac?: string;
  anotacoesNaapi?: string;
  adaptacoesNecessarias?: string;
  necessidadesRelatoriosMedicos?: string;
  // --- FIM ---

  curso: Curso;
  turma: Turma;
  diagnosticos: Diagnostico[];

  // (Laudos, PEIs, Atendimentos serão carregados separadamente)
}


// --- INTERFACE ALUNOINSERT (DTO) ATUALIZADA ---
// Este é o objeto que o nosso formulário de 3 etapas envia
export interface AlunoInsert {
  // Etapa 1
  nome: string;
  nomeSocial?: string;
  dataNascimento?: Date;
  cpf?: string;
  telefoneEstudante?: string;
  // fotoFile é tratado pelo FormData, não está no DTO

  // Etapa 2
  matricula: string;
  prioridade: string; // "Baixa", "Média", "Alta"
  provaOutroEspaco: boolean;
  processoSipac?: string;
  cursoId: number;
  turmaId: number;

  // Etapa 3
  diagnosticosId?: number[];
  anotacoesNaapi?: string;
  adaptacoesNecessarias?: string;
  necessidadesRelatoriosMedicos?: string;
}
