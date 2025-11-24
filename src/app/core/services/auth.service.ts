import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, of, map } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';

const AUTH_TOKEN_KEY = 'naapi_auth_token';
const API_URL = '/api';

interface TokenResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isInitializingSubject = new BehaviorSubject<boolean>(true);
  public isInitializing$ = this.isInitializingSubject.asObservable();

  private currentToken: string | null = null;

  constructor() {
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (savedToken) {
      this.currentToken = savedToken;
      this.validateTokenAndLoadUser(true);
    } else {
      this.isInitializingSubject.next(false);
    }
  }

  login(email: string, senha: string): Observable<boolean> {

    return this.http.post<TokenResponse>(`${API_URL}/auth/login`, { email, senha }).pipe(
      tap((response) => {
        localStorage.setItem(AUTH_TOKEN_KEY, response.token);
        this.currentToken = response.token;
        this.validateTokenAndLoadUser();
      }),
      map(() => true),
      catchError((error) => {
        this.logoutInternal();
        return of(false);
      })
    );
  }

  logout(): void {
    this.logoutInternal();
    this.router.navigate(['/login']);
  }

  private logoutInternal(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    this.currentToken = null;
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentToken;
  }

  getAuthToken(): string | null {
    if (!this.currentToken) {
      return null;
    }
    return 'Bearer ' + this.currentToken;
  }

  public validateTokenAndLoadUser(isInitialLoad: boolean = false): void {
    if (this.currentToken) {
        this.http.get<Usuario>(`${API_URL}/usuarios/me`).pipe(
            finalize(() => {
              if (isInitialLoad) {
                this.isInitializingSubject.next(false);
              }
            })
        ).subscribe({
          next: (user: Usuario) => {
            this.currentUserSubject.next(user);
          },
          error: () => {
            this.logoutInternal();
          }
        });
    } else {
        this.logoutInternal();
        if (isInitialLoad) {
          this.isInitializingSubject.next(false);
        }
    }
  }
}
