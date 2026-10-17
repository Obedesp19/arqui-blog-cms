import {
  Component,
  DestroyRef,
  Input,
  OnChanges,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, finalize, takeUntil } from 'rxjs';

import { SHARED_IMPORTS } from '../../shared/shared_imports';
import { AuthService } from '../../services/auth.service';
import {
  CommentPage,
  CommentsApiService,
} from '../../services/comments-api.service';
import { articleError } from '../../services/articles.service';

@Component({
  selector: 'app-post-comments',
  standalone: true,
  imports: [...SHARED_IMPORTS, RouterLink],
  templateUrl: './post-comments.html',
})
export class PostComments implements OnChanges {
  @Input({ required: true }) postId!: number;

  readonly auth = inject(AuthService);

  private readonly api = inject(CommentsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cancelRequests$ = new Subject<void>();

  page = 1;
  result: CommentPage | null = null;
  loading = false;
  sending = false;
  listError = '';
  submitError = '';
  success = '';
  content = '';

  get busy(): boolean {
    return this.loading || this.sending;
  }

  get canComment(): boolean {
    return this.auth.hasRole([
      'LECTOR',
      'AUTOR',
      'EDITOR',
      'ADMINISTRADOR',
    ]);
  }

  ngOnChanges(): void {
    this.cancelRequests$.next();

    this.page = 1;
    this.result = null;
    this.content = '';
    this.listError = '';
    this.submitError = '';
    this.success = '';

    this.loadPage(1);
  }

  loadPage(page: number): void {
    if (this.busy) return;

    if (
      !Number.isSafeInteger(this.postId) ||
      this.postId < 1 ||
      !Number.isSafeInteger(page) ||
      page < 1
    ) {
      this.listError = 'La solicitud de comentarios no es válida.';
      return;
    }

    this.loading = true;
    this.listError = '';
    this.result = null;

    this.api.list(this.postId, page).pipe(
      takeUntil(this.cancelRequests$),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.loading = false;
      }),
    ).subscribe({
      next: result => {
        this.result = result;
        this.page = page;
      },
      error: error => {
        this.listError = articleError(error);
      },
    });
  }

  enviar(): void {
    if (this.busy || !this.canComment) return;

    this.submitError = '';
    this.success = '';

    const content = this.content.trim();

    if (!content || content.length > 2000) {
      this.submitError =
        'Escribe un comentario de entre 1 y 2000 caracteres.';
      return;
    }

    this.sending = true;

    this.api.create(this.postId, content).pipe(
      takeUntil(this.cancelRequests$),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.sending = false;
      }),
    ).subscribe({
      next: () => {
        this.content = '';
        this.success =
          'Comentario enviado. Será visible cuando un editor o administrador lo apruebe.';
      },
      error: error => {
        this.submitError = articleError(error);
      },
    });
  }
}