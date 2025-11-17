// src/app/core/models/pei.model.ts

/**
 * Baseado em PeiDTO.java
 */
export interface PEI {
  id: number;
  dataInicio: string; // Vem como string ISO
  dataFim?: string;
  metas: string;
  estrategias: string;
  avaliacao?: string;
  alunoId: number;
  alunoNome: string;
  responsavelId: number;
  responsavelNome: string;
}

/**
 * Baseado em PeiInsertDTO.java (para referência futura)
 */
export interface PeiInsert {
  dataInicio: string;
  dataFim?: string;
  metas: string;
  estrategias: string;
  avaliacao?: string;
  alunoId: number;
  responsavelId: number;
}
