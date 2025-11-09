import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, of, map } from 'rxjs';
import { Usuario } from '../models/usuario.model'; // Já criamos este modelo

// Chave para salvar o cabeçalho no localStorage
const AUTH_HEADER_KEY = 'naapi_auth_header';
const API_URL = '/api'; // URL do proxy

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // BehaviorSubject para que outros componentes possam "ouvir" o estado de login
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private currentAuthHeader: string | null = null;

  constructor() {
    // Ao iniciar o serviço, tenta carregar o header do localStorage
    const savedHeader = localStorage.getItem(AUTH_HEADER_KEY);
    if (savedHeader) {
      this.currentAuthHeader = savedHeader;
      this.validateTokenAndLoadUser();
    }
  }

  /**
   * Tenta fazer login na API usando Basic Auth.
   */
  login(email: string, senha: string): Observable<boolean> {
    // 1. Cria o cabeçalho Basic Auth (Email:Senha em Base64)
    // btoa() é uma função do navegador que codifica para Base64
    const basicAuthHeader = 'Basic ' + btoa(email + ':' + senha);

    const headers = new HttpHeaders({
      'Authorization': basicAuthHeader
    });

    // 2. Tenta acessar um endpoint protegido (ex: /usuarios/me)
    // Se a API retornar 200, as credenciais estão corretas.
    return this.http.get<Usuario>(`${API_URL}/usuarios/me`, { headers }).pipe(
      tap((user) => {
        // 3. Sucesso! Salva o header e o usuário
        localStorage.setItem(AUTH_HEADER_KEY, basicAuthHeader);
        this.currentAuthHeader = basicAuthHeader;
        this.currentUserSubject.next(user);
      }),
      map(() => true), // Retorna true em caso de sucesso
      catchError((error) => {
        // 4. Falha (401 Unauthorized, etc.)
        this.logout();
        return of(false); // Retorna false em caso de erro
      })
    );
  }

  /**
   * Desloga o usuário
   */
  logout(): void {
    localStorage.removeItem(AUTH_HEADER_KEY);
    this.currentAuthHeader = null;
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']); // Redireciona para o login
  }

  /**
   * Verifica se o usuário está logado (se temos um header salvo)
   */
  isLoggedIn(): boolean {
    return !!this.currentAuthHeader;
  }

  /**
   * Retorna o cabeçalho de autorização para o Interceptor
   */
  getAuthHeader(): string | null {
    return this.currentAuthHeader;
  }

  /**
   * Se o app recarregar, valida o token salvo
   */
  private validateTokenAndLoadUser(): void {
    if (!this.currentAuthHeader) return;

    const headers = new HttpHeaders({ 'Authorization': this.currentAuthHeader });

    this.http.get<Usuario>(`${API_URL}/usuarios/me`, { headers }).subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
      },
      error: () => {
        // O token salvo é inválido (ex: senha mudou, token expirou)
        this.logout();
      }
    });
  }
}
