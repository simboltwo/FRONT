// src/app/core/models/laudo.model.ts

/**
 * Baseado em LaudoDTO.java
 */
export interface Laudo {
  id: number;
  dataEmissao: string; // Vem como string ISO, o pipe 'date' formata
  urlArquivo: string;
  descricao: string;
  alunoId: number;
}

/**
 * Baseado em LaudoInsertDTO.java (para referência futura)
 */
export interface LaudoInsert {
  dataEmissao?: string;
  urlArquivo: string;
  descricao?: string;
  alunoId: number;
}
