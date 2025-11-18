/*
 * Arquivo: simboltwo/front/FRONT-6ada510ac5875a89a10169e7efd5d09b58529961/src/app/core/models/atendimento.model.ts
 * Descrição: Adicionada a interface 'AtendimentoConclusao'.
 */
// Importa a interface do arquivo centralizado
import { TipoAtendimento } from './aluno.model';

// Baseado em AtendimentoInsertDTO.java e AtendimentoDTO.java
export interface AtendimentoInsert {
  dataHora: string; // Enviar como string ISO (ex: 2025-11-09T14:30:00)
  descricao: string;
  status: string; // Ex: "Agendado", "Realizado", "Cancelado"
  alunoId: number;
  responsavelId: number;
  tipoAtendimentoId: number;
}

// --- INÍCIO DA MUDANÇA ---
// Baseado em AtendimentoConclusaoDTO.java
export interface AtendimentoConclusao {
  descricao: string;
  status: string;
}
// --- FIM DA MUDANÇA ---

export interface Atendimento {
  id: number;
  dataHora: string;
  descricao: string;
  status: string;
  alunoId: number;
  alunoNome: string;
  responsavelId: number;
  responsavelNome: string;
  tipoAtendimentoId: number;
  tipoAtendimentoNome: string;
}
