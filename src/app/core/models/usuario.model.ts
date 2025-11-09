// Baseado em UsuarioDTO.java
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papeis: { id: number; authority: string }[];
}
