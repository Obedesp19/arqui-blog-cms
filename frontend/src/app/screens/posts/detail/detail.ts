import { MarkdownContent } from '../../../components/markdown-content/markdown-content';
import { PostComments } from '../../../components/post-comments/post-comments';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Subject,
  catchError,
  combineLatest,
  finalize,
  of,
  startWith,
  switchMap,
} from 'rxjs';

import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Sidebar } from '../../../partials/sidebar/sidebar';
import { Footer } from '../../../partials/footer/footer';
import { AuthService } from '../../../services/auth.service';
import {
  Article,
  ArticlesService,
  EditorialAction,
  articleError,
} from '../../../services/articles.service';

@Component({
  selector: 'app-posts-detail',
  standalone: true,
    imports: [
    ...SHARED_IMPORTS,
    RouterLink,
    Navbar,
    Sidebar,
    Footer,
    PostComments,
    MarkdownContent,
  ],
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss'],
})
export class PostsDetail implements OnInit {
  readonly auth = inject(AuthService);
  readonly api = inject(ArticlesService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<void>();

  drawerOpen = false;
  workspace = false;
  loading = false;
  deleting = false;
  transitioning = false;
  error = '';
  success = '';
  post: Article | null = null;

  get busy(): boolean {
    return this.loading || this.deleting || this.transitioning;
  }

  ngOnInit(): void {
    combineLatest([
      this.route.data,
      this.route.paramMap,
      this.reload$.pipe(startWith(undefined)),
    ]).pipe(
      switchMap(([data, params]) => {
        this.workspace = data['workspace'] === true;
        this.error = '';
        this.success = '';
        this.post = null;
        this.loading = false;

        const id = Number(params.get('id'));

        if (!Number.isSafeInteger(id) || id < 1) {
          this.error = 'El identificador del artículo no es válido.';
          return of(null);
        }

        this.loading = true;

        return this.api.get(id, this.workspace).pipe(
          catchError(error => {
            this.error = articleError(error);
            return of(null);
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(post => {
      this.post = post;
      this.loading = false;
    });
  }

  recargar(): void {
    if (this.busy) return;

    this.reload$.next();
  }

  ejecutarAccion(action: EditorialAction): void {
    const post = this.post;

    if (
      !post ||
      !this.workspace ||
      this.busy ||
      !this.api.canTransition(post, action)
    ) {
      return;
    }

    const option = this.api.editorialActions(post)
      .find(item => item.action === action);

    if (!option) return;

    const confirmed = window.confirm(
      `¿Confirmas la acción "${option.label}" para "${post.title}"?`,
    );

    if (!confirmed) return;

    this.transitioning = true;
    this.error = '';
    this.success = '';

    this.api.transition(post.id, action).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.transitioning = false;
      }),
    ).subscribe({
      next: updated => {
        if (this.post?.id !== post.id || !this.workspace) {
          return;
        }

        this.post = updated;
        this.success = 'Acción editorial realizada correctamente.';
      },
      error: error => {
        if (this.post?.id !== post.id || !this.workspace) {
          return;
        }

        this.error = articleError(error);
      },
    });
  }

  eliminar(): void {
    const post = this.post;
    const wasWorkspace = this.workspace;

    if (!post || this.busy || !this.api.canDelete(post)) {
      return;
    }

    if (!window.confirm(`¿Eliminar definitivamente "${post.title}"?`)) {
      return;
    }

    this.deleting = true;
    this.error = '';
    this.success = '';

    this.api.delete(post.id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.deleting = false;
      }),
    ).subscribe({
      next: () => {
        if (
          this.post?.id !== post.id ||
          this.workspace !== wasWorkspace
        ) {
          return;
        }

        this.post = null;

        this.router.navigate([
          wasWorkspace ? '/workspace/posts' : '/posts',
        ]);
      },
      error: error => {
        if (
          this.post?.id === post.id &&
          this.workspace === wasWorkspace
        ) {
          this.error = articleError(error);
        }
      },
    });
  }
}