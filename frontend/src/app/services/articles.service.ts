import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Article {
  id: number;
  title: string;
  content: string;
  etiquetas: string;
  estado: 'BORRADOR' | 'PUBLICADO' | 'OCULTO';
  author: { id: number; first_name: string; last_name: string };
  categoria: { id: number; nombre: string } | null;
  creation: string;
  update: string;
}

export interface ArticleInput {
  title: string;
  content: string;
  etiquetas: string;
  categoria_id: number | null;
}

export interface ArticlePage {
  count: number;
  next: string | null;
  previous: string | null;
  results: Article[];
}

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly base = environment.url_api.replace(/\/+$/, '');

  list(workspace: boolean, page: number) {
    const path = workspace ? 'workspace/posts' : 'posts';
    return this.http.get<ArticlePage>(`${this.base}/${path}/`, {
      params: { page: String(page) },
    });
  }

  get(id: number, workspace: boolean) {
    const path = workspace ? 'workspace/posts' : 'posts';
    return this.http.get<Article>(`${this.base}/${path}/${id}/`);
  }

  create(input: ArticleInput) {
    return this.http.post<Article>(`${this.base}/posts/`, this.payload(input));
  }

  update(id: number, input: ArticleInput) {
    return this.http.patch<Article>(`${this.base}/posts/${id}/`, this.payload(input));
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/posts/${id}/`);
  }

  canCreate(): boolean {
    return this.auth.hasRole(['AUTOR', 'EDITOR', 'ADMINISTRADOR']);
  }

  canEdit(post: Article): boolean {
    return post.estado === 'BORRADOR' && this.canManage(post);
  }

  canDelete(post: Article): boolean {
    return this.auth.hasRole(['EDITOR', 'ADMINISTRADOR']) || (
      this.auth.hasRole(['AUTOR']) &&
      post.author.id === this.auth.getUserId() &&
      post.estado === 'BORRADOR'
    );
  }

  private canManage(post: Article): boolean {
    return this.auth.hasRole(['EDITOR', 'ADMINISTRADOR']) || (
      this.auth.hasRole(['AUTOR']) &&
      post.author.id === this.auth.getUserId()
    );
  }

  private payload(input: ArticleInput): ArticleInput {
    return {
      title: input.title.trim(),
      content: input.content,
      etiquetas: input.etiquetas.trim(),
      categoria_id: input.categoria_id,
    };
  }
}

export function articleError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'No se pudo completar la operación.';
  if (error.status === 0) return 'No se pudo conectar con el servidor.';
  if (error.status === 401) return 'Tu sesión terminó. Inicia sesión nuevamente.';
  if (error.status === 403) return 'No tienes permiso para realizar esta acción.';
  if (error.status === 404) return 'El artículo o la página no existe, o no tienes acceso.';
  if (error.status === 400 && error.error && typeof error.error === 'object') {
    const messages = Object.values(error.error).flat()
      .filter((value): value is string => typeof value === 'string');
    if (messages.length) return messages.join(' ');
  }
  return 'No se pudo completar la operación. Intenta nuevamente.';
}
