import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthUser, UserRole } from '../models/auth-user.model';
import { environment } from '../../environments/environment';

interface LoginResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  token: string;
  roles: string[];
}

interface StoredSession {
  user: AuthUser;
  token: string;
}

interface ProfileUpdateInput {
  firstName: string;
  lastName: string;
  lastNameMother: string;
  email: string;
  avatar: string;
}

const SESSION_KEY = 'campusforum_session';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public readonly currentUser$: Observable<AuthUser | null> =
    this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const session: StoredSession = JSON.parse(stored);
        this.currentUserSubject.next(session.user);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }

  public getToken(): string | null {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    try {
      return (JSON.parse(stored) as StoredSession).token;
    } catch {
      return null;
    }
  }

  public authenticate(
    email: string,
    password: string
  ): Observable<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
    return this.http
      .post<LoginResponse>(`${environment.url_api}/token/`, {
        username: email.trim().toLowerCase(),
        password,
      })
      .pipe(
        map((response) => {
          const user: AuthUser = {
            id: response.id,
            nombre: `${response.first_name} ${response.last_name}`.trim(),
            email: response.email,
            role: this.mapRole(response.roles),
            avatar: 'assets/images/avatares/avatar-gorra-lentes.png',
          };
          const session: StoredSession = { user, token: response.token };
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
          this.currentUserSubject.next(user);
          return { ok: true as const, user };
        }),
        catchError((err: HttpErrorResponse) => {
          const error =
            err.status === 400
              ? 'Correo o contraseña incorrectos.'
              : 'Error de conexión. Intenta más tarde.';
          return of({ ok: false as const, error });
        })
      );
  }

  public register(input: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: string;
  }): Observable<{ ok: true } | { ok: false; error: string }> {
    return this.http
      .post(`${environment.url_api}/users/`, {
        first_name: input.first_name,
        last_name: input.last_name,
        email: input.email.trim().toLowerCase(),
        password: input.password,
        role: input.role,
      })
      .pipe(
        map(() => ({ ok: true as const })),
        catchError((err: HttpErrorResponse) => {
          const error =
            err.status === 400
              ? 'Ese correo ya está registrado.'
              : 'Error al registrar. Intenta más tarde.';
          return of({ ok: false as const, error });
        })
      );
  }

  public login(user: AuthUser): void {
    this.currentUserSubject.next(user);
  }

  public logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.get(`${environment.url_api}/logout/`).subscribe({
        error: () => {},
      });
    }
    localStorage.removeItem(SESSION_KEY);
    this.currentUserSubject.next(null);
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  public getUserRole(): UserRole | null {
    return this.getCurrentUser()?.role ?? null;
  }

  public getUserName(): string {
    return this.getCurrentUser()?.nombre ?? '';
  }

  public getUserFirstName(): string {
    const nombre = this.getUserName();
    return nombre.split(' ')[0] ?? nombre;
  }

  public getUserLastName(): string {
    const parts = this.getUserName().split(' ');
    return parts[1] ?? '';
  }

  public getUserLastNameMother(): string {
    const parts = this.getUserName().split(' ');
    return parts.slice(2).join(' ');
  }

  public getUserEmail(): string {
    return this.getCurrentUser()?.email ?? '';
  }

  public getUserAvatar(): string {
    return (
      this.getCurrentUser()?.avatar ??
      'assets/images/avatares/avatar-gorra-lentes.png'
    );
  }

  public updateProfile(
    input: ProfileUpdateInput
  ): { ok: true } | { ok: false; error: string } {
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return { ok: false, error: 'No hay usuario autenticado.' };
    }

    const updatedUser: AuthUser = {
      ...currentUser,
      nombre: [input.firstName, input.lastName, input.lastNameMother]
        .map((p) => p.trim())
        .filter(Boolean)
        .join(' '),
      email: input.email.trim().toLowerCase(),
      avatar: input.avatar,
    };

    const session: StoredSession = {
      user: updatedUser,
      token: this.getToken() ?? '',
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.currentUserSubject.next(updatedUser);

    return { ok: true };
  }

  public hasRole(roles: UserRole[]): boolean {
    const role = this.getUserRole();
    if (!role) return false;
    return roles.includes(role);
  }

  public isAdmin(): boolean {
    return this.getUserRole() === 'ADMINISTRADOR';
  }

  public isProfesor(): boolean {
    return this.getUserRole() === 'PROFESOR';
  }

  public isEstudiante(): boolean {
    return this.getUserRole() === 'ESTUDIANTE';
  }

  private mapRole(roles: string[]): UserRole {
    if (roles.includes('administrador')) return 'ADMINISTRADOR';
    if (roles.includes('profesor')) return 'PROFESOR';
    return 'ESTUDIANTE';
  }

  public getUserId(): number | null {

    const currentUser = this.getCurrentUser();

    return currentUser ? currentUser.id : null;
  }
}
