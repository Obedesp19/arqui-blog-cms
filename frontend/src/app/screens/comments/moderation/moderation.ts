import {
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Sidebar } from '../../../partials/sidebar/sidebar';
import { Footer } from '../../../partials/footer/footer';
import { AuthService } from '../../../services/auth.service';
import { articleError } from '../../../services/articles.service';
import {
  CommentFilter,
  CommentModerationService,
  ModerationAction,
  WorkspaceComment,
  WorkspaceCommentPage,
} from '../../../services/comment-moderation.service';

@Component({
  selector: 'app-comments-moderation',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    RouterLink,
    Navbar,
    Sidebar,
    Footer,
  ],
  templateUrl: './moderation.html',
  styleUrl: './moderation.scss',
})
export class CommentsModeration implements OnInit {
  readonly auth = inject(AuthService);

  private readonly api = inject(CommentModerationService);
  private readonly destroyRef = inject(DestroyRef);

  drawerOpen = false;
  loading = false;
  savingId: number | null = null;
  estado: CommentFilter = 'PENDIENTE';
  page = 1;
  result: WorkspaceCommentPage | null = null;
  error = '';
  success = '';

  get busy(): boolean {
    return this.loading || this.savingId !== null;
  }

  get canManage(): boolean {
    return this.auth.hasRole(['EDITOR', 'ADMINISTRADOR']);
  }

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number, keepSuccess = false): void {
    if (this.busy) return;

    if (!this.canManage) {
      this.result = null;
      this.error = 'No tienes permiso para moderar comentarios.';
      return;
    }

    if (!Number.isSafeInteger(page) || page < 1) return;

    this.loading = true;
    this.page = page;
    this.result = null;
    this.error = '';

    if (!keepSuccess) {
      this.success = '';
    }

    this.api.list(this.estado, page).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.loading = false;
      }),
    ).subscribe({
      next: result => {
        this.result = result;
      },
      error: error => {
        this.error = articleError(error);
      },
    });
  }

  moderate(
    comment: WorkspaceComment,
    action: ModerationAction,
  ): void {
    if (
      this.busy ||
      !this.canManage ||
      comment.estado !== 'PENDIENTE'
    ) {
      return;
    }

    if (
      action === 'APROBAR' &&
      comment.post.estado !== 'PUBLICADO'
    ) {
      this.error =
        'Solo puedes aprobar comentarios de artículos publicados.';
      return;
    }

    const decision = action === 'APROBAR' ? 'aprobar' : 'rechazar';

    if (!window.confirm(`¿Confirmas que deseas ${decision} este comentario?`)) {
      return;
    }

    this.savingId = comment.id;
    this.error = '';
    this.success = '';

    this.api.moderate(comment.id, action).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        this.savingId = null;
        this.success = action === 'APROBAR'
          ? 'Comentario aprobado.'
          : 'Comentario rechazado.';

        this.loadPage(1, true);
      },
      error: error => {
        this.savingId = null;
        this.error = articleError(error);
      },
    });
  }
}