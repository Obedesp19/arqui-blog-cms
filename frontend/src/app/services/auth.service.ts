import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

import { AuthUser, UserRole } from '../models/auth-user.model';
import { environment } from '../../environments/environment';

interface SessionResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
}

interface LoginResponse extends SessionResponse {
  token: string;
}

interface StoredSession {
  user: AuthUser;
  token: string;
}

interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

interface ProfileUpdateInput {
  firstName: string;
  lastName: string;
  lastNameMother: string;
  email: string;
  avatar: string;
}

type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

const SESSION_KEY = 'campusforum_session';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.url_api.replace(/\/+$/, '');

  private readonly currentUserSubject =
    new BehaviorSubject<AuthUser | null>(null);

  public readonly currentUser$ =
    this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  public getToken(): string | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);

      if (!raw) {
        return null;
      }

      const session = JSON.parse(raw);

      return typeof session?.token === 'string' && session.token.trim()
        ? session.token
        : null;
    } catch {
      return null;
    }
  }

  public clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    this.currentUserSubject.next(null);
  }

  private saveSession(user: AuthUser, token: string): void {
    const session: StoredSession = { user, token };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.currentUserSubject.next(user);
  }

  private toUser(response: SessionResponse): AuthUser {
    const allowed: UserRole[] = [
      'LECTOR',
      'AUTOR',
      'EDITOR',
      'ADMINISTRADOR',
    ];

    const role = response.roles?.[0];

    if (
      response.roles?.length !== 1 ||
      !allowed.includes(role as UserRole)
    ) {
      throw new Error('La cuenta no tiene un rol CMS válido.');
    }

    return {
      id: response.id,
      nombre: `${response.first_name} ${response.last_name}`.trim(),
      email: response.email,
      role: role as UserRole,
      avatar: 'assets/images/avatares/avatar-gorra-lentes.png',
    };
  }

  public refreshSession(): Observable<boolean> {
    const token = this.getToken();

    if (!token) {
      this.clearSession();
      return of(false);
    }

    return this.http
      .get<SessionResponse>(`${this.apiUrl}/me/`)
      .pipe(
        timeout(10000),
        map((response) => {
          if (this.getToken() !== token) {
            return false;
          }

          this.saveSession(this.toUser(response), token);
          return true;
        }),
        catchError(() => {
          if (this.getToken() === token) {
            this.clearSession();
          }

          return of(false);
        }),
      );
  }

  public authenticate(
    email: string,
    password: string,
  ): Observable<
    { ok: true; user: AuthUser } |
    { ok: false; error: string }
  > {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/token/`, {
        username: email.trim().toLowerCase(),
        password,
      })
      .pipe(
        timeout(10000),
        map((response) => {
          if (!response.token) {
            throw new Error('La API no devolvió un token.');
          }

          const user = this.toUser(response);

          this.saveSession(user, response.token);
          return { ok: true as const, user };
        }),
        catchError((error) =>
          of({
            ok: false as const,
            error: this.errorMessage(
              error,
              'No se pudo iniciar sesión. Intenta nuevamente.',
            ),
          }),
        ),
      );
  }

  public register(input: RegisterInput): Observable<ActionResult> {
    return this.http
      .post(`${this.apiUrl}/users/`, {
        first_name: input.first_name.trim(),
        last_name: input.last_name.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
      })
      .pipe(
        timeout(10000),
        map(() => ({ ok: true as const })),
        catchError((error) =>
          of({
            ok: false as const,
            error: this.errorMessage(
              error,
              'No se pudo completar el registro.',
            ),
          }),
        ),
      );
  }

  public logout(): Observable<ActionResult> {
    const token = this.getToken();

    if (!token) {
      this.clearSession();
      return of({ ok: true });
    }

    return this.http
      .post(
        `${this.apiUrl}/logout/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .pipe(
        timeout(10000),
        map(() => {
          if (this.getToken() === token) {
            this.clearSession();
          }

          return { ok: true as const };
        }),
        catchError((error) => {
          if (
            error instanceof HttpErrorResponse &&
            error.status === 401
          ) {
            if (this.getToken() === token) {
              this.clearSession();
            }

            return of({ ok: true as const });
          }

          return of({
            ok: false as const,
            error:
              'No se pudo cerrar la sesión en el servidor. ' +
              'Revisa la conexión e intenta nuevamente.',
          });
        }),
      );
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }

    if (error.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }

    if (error.status >= 500) {
      return fallback;
    }

    if (error.error && typeof error.error === 'object') {
      const messages = Object.values(error.error)
        .flat()
        .filter(
          (value): value is string => typeof value === 'string',
        );

      if (messages.length) {
        return messages.join(' ');
      }
    }

    return fallback;
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  public isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  public getUserRole(): UserRole | null {
    return this.getCurrentUser()?.role ?? null;
  }

  public getUserId(): number | null {
    return this.getCurrentUser()?.id ?? null;
  }

  public getUserName(): string {
    return this.getCurrentUser()?.nombre ?? '';
  }

  public getUserFirstName(): string {
    return this.getUserName().split(' ')[0] ?? '';
  }

  public getUserLastName(): string {
    return this.getUserName().split(' ')[1] ?? '';
  }

  public getUserLastNameMother(): string {
    return this.getUserName().split(' ').slice(2).join(' ');
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

  public hasRole(roles: UserRole[]): boolean {
    const role = this.getUserRole();

    return (
      this.isAuthenticated() &&
      role !== null &&
      roles.includes(role)
    );
  }

  public isAdmin(): boolean {
    return this.hasRole(['ADMINISTRADOR']);
  }

  public isEditor(): boolean {
    return this.hasRole(['EDITOR']);
  }

  public isAutor(): boolean {
    return this.hasRole(['AUTOR']);
  }

  public isLector(): boolean {
    return this.hasRole(['LECTOR']);
  }

  public updateProfile(_input: ProfileUpdateInput): ActionResult {
    return {
      ok: false,
      error:
        'La edición del perfil todavía no está conectada al servidor.',
    };
  }
}