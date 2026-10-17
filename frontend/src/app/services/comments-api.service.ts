import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type CommentStatus =
  | 'PENDIENTE'
  | 'APROBADO'
  | 'RECHAZADO';

export interface ArticleComment {
  id: number;
  post_id: number;
  author: {
    id: number;
    first_name: string;
    last_name: string;
  };
  content: string;
  estado: CommentStatus;
  creation: string;
  update: string;
}

export interface CommentPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: ArticleComment[];
}

@Injectable({ providedIn: 'root' })
export class CommentsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.url_api.replace(/\/+$/, '');

  list(postId: number, page: number) {
    return this.http.get<CommentPage>(
      `${this.base}/posts/${postId}/comments/`,
      {
        params: { page: String(page) },
      },
    );
  }

  create(postId: number, content: string) {
    return this.http.post<ArticleComment>(
      `${this.base}/posts/${postId}/comments/`,
      { content: content.trim() },
    );
  }
}