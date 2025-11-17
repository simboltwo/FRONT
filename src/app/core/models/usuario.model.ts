// src/app/core/models/usuario.model.ts

// --- INÍCIO DA MUDANÇA: Adicionar Papel ---
// Baseado em PapelDTO.java
export interface Papel {
  id: number;
  authority: string;
}
// --- FIM DA MUDANÇA ---

// Baseado em UsuarioDTO.java
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papeis: Papel[]; // Atualizado para usar a interface
}

// --- INÍCIO DA MUDANÇA: Adicionar DTOs de Insert e Update ---
// Baseado em UsuarioInsertDTO.java
export interface UsuarioInsert {
  nome: string;
  email: string;
  senha?: string; // Senha é opcional no formulário, mas obrigatória na API
  papeis: number[]; // Enviamos apenas os IDs
}

// Baseado em UsuarioUpdateDTO.java
export interface UsuarioUpdate {
  nome: string;
  email: string;
  papeis: number[]; // Enviamos apenas os IDs
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
// --- FIM DA MUDANÇA ---
