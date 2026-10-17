import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  ArticleComment,
  CommentStatus,
} from './comments-api.service';
import { ArticleStatus } from './articles.service';

export type CommentFilter = CommentStatus | 'TODOS';
export type ModerationAction = 'APROBAR' | 'RECHAZAR';

export interface WorkspaceComment {
  id: number;
  post: {
    id: number;
    title: string;
    estado: ArticleStatus;
  };
  author: ArticleComment['author'];
  content: string;
  estado: CommentStatus;
  moderated_by: ArticleComment['author'] | null;
  moderated_at: string | null;
  creation: string;
  update: string;
}

export interface WorkspaceCommentPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: WorkspaceComment[];
}

@Injectable({ providedIn: 'root' })
export class CommentModerationService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.url_api.replace(/\/+$/, '');

  list(estado: CommentFilter, page: number) {
    return this.http.get<WorkspaceCommentPage>(
      `${this.base}/workspace/comments/`,
      {
        params: {
          estado,
          page: String(page),
        },
      },
    );
  }

  moderate(id: number, action: ModerationAction) {
    return this.http.post<WorkspaceComment>(
      `${this.base}/workspace/comments/${id}/moderate/`,
      { action },
    );
  }
}