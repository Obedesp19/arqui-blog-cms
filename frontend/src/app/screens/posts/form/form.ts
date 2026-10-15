import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Sidebar } from '../../../partials/sidebar/sidebar';
import { Footer } from '../../../partials/footer/footer';
import { AuthService } from '../../../services/auth.service';
import { Article, ArticleInput, ArticlesService, articleError } from '../../../services/articles.service';

@Component({
  selector: 'app-posts-form',
  standalone: true,
  imports: [...SHARED_IMPORTS, RouterLink, Navbar, Sidebar, Footer],
  templateUrl: './form.html',
  styleUrls: ['./form.scss'],
})
export class PostsForm implements OnInit {
  readonly auth = inject(AuthService);
  readonly api = inject(ArticlesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  drawerOpen = false;
  loading = false;
  saving = false;
  editable = false;
  error = '';
  postId: number | null = null;
  original: Article | null = null;
  title = '';
  content = '';
  etiquetas = '';

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.error = '';
        this.editable = false;
        this.original = null;
        this.title = this.content = this.etiquetas = '';
        const raw = params.get('id');
        this.postId = raw === null ? null : Number(raw);
        if (this.postId === null) {
          this.editable = this.api.canCreate();
          return of(null);
        }
        if (!Number.isSafeInteger(this.postId) || this.postId < 1) {
          this.error = 'El identificador del artículo no es válido.';
          return of(null);
        }
        this.loading = true;
        return this.api.get(this.postId, true).pipe(
          catchError(error => {
            this.error = articleError(error);
            return of(null);
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(post => {
      this.loading = false;
      if (!post) return;
      this.original = post;
      this.editable = this.api.canEdit(post);
      if (!this.editable) {
        this.error = 'Solo puedes editar borradores para los que tengas permiso.';
        return;
      }
      this.title = post.title;
      this.content = post.content;
      this.etiquetas = post.etiquetas;
    });
  }

  guardar(): void {
    if (this.loading || this.saving || !this.editable) return;
    this.error = '';
    if (this.original ? !this.api.canEdit(this.original) : !this.api.canCreate()) {
      this.error = 'No tienes permiso para guardar este artículo.';
      return;
    }
    if (!this.title.trim() || this.title.trim().length > 255) {
      this.error = 'Escribe un título de entre 1 y 255 caracteres.';
      return;
    }
    if (!this.content.trim()) {
      this.error = 'El contenido es obligatorio.';
      return;
    }
    if (this.etiquetas.trim().length > 255) {
      this.error = 'Las etiquetas no pueden superar los 255 caracteres.';
      return;
    }
    const input: ArticleInput = {
      title: this.title,
      content: this.content,
      etiquetas: this.etiquetas,
      categoria_id: this.original?.categoria?.id ?? null,
    };
    const request = this.postId === null
      ? this.api.create(input)
      : this.api.update(this.postId, input);
    this.saving = true;
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: post => {
        this.saving = false;
        this.router.navigate(['/workspace/posts', post.id]);
      },
      error: error => {
        this.saving = false;
        this.error = articleError(error);
      },
    });
  }
}
