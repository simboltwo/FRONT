import { Curso, Turma } from "./aluno.model";

export interface HistoricoAcademico {
  id: number;
  alunoId: number;
  curso: Curso;
  turma?: Turma;
  dataInicio: string;
  dataFim?: string;
}

export interface HistoricoAcademicoInsert {
  alunoId: number;
  cursoId: number;
  turmaId?: number;
  dataInicio: string;
  dataFim?: string;
}
