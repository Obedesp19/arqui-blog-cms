import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, of, switchMap } from 'rxjs';
import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Sidebar } from '../../../partials/sidebar/sidebar';
import { Footer } from '../../../partials/footer/footer';
import { AuthService } from '../../../services/auth.service';
import { Article, ArticlesService, articleError } from '../../../services/articles.service';

@Component({
  selector: 'app-posts-detail',
  standalone: true,
  imports: [...SHARED_IMPORTS, RouterLink, Navbar, Sidebar, Footer],
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss'],
})
export class PostsDetail implements OnInit {
  readonly auth = inject(AuthService);
  readonly api = inject(ArticlesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  drawerOpen = false;
  workspace = false;
  loading = false;
  deleting = false;
  error = '';
  post: Article | null = null;

  ngOnInit(): void {
    combineLatest([this.route.data, this.route.paramMap]).pipe(
      switchMap(([data, params]) => {
        this.workspace = data['workspace'] === true;
        this.error = '';
        this.post = null;
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

  eliminar(): void {
    const post = this.post;
    if (!post || this.deleting || !this.api.canDelete(post)) return;
    if (!window.confirm(`¿Eliminar definitivamente "${post.title}"?`)) return;
    this.deleting = true;
    this.error = '';
    this.api.delete(post.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.router.navigate([this.workspace ? '/workspace/posts' : '/posts']);
      },
      error: error => {
        this.deleting = false;
        this.error = articleError(error);
      },
    });
  }
}
