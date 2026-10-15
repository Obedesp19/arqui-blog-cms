import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, of, switchMap } from 'rxjs';
import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Sidebar } from '../../../partials/sidebar/sidebar';
import { Footer } from '../../../partials/footer/footer';
import { AuthService } from '../../../services/auth.service';
import { ArticlePage, ArticlesService, articleError } from '../../../services/articles.service';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [...SHARED_IMPORTS, RouterLink, Navbar, Sidebar, Footer],
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
})
export class PostsList implements OnInit {
  readonly auth = inject(AuthService);
  readonly api = inject(ArticlesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  drawerOpen = false;
  workspace = false;
  loading = false;
  error = '';
  page = 1;
  result: ArticlePage | null = null;

  ngOnInit(): void {
    combineLatest([this.route.data, this.route.queryParamMap]).pipe(
      switchMap(([data, params]) => {
        this.workspace = data['workspace'] === true;
        const page = Number(params.get('page') ?? 1);
        this.page = Number.isSafeInteger(page) && page > 0 ? page : 1;
        this.loading = true;
        this.error = '';
        this.result = null;
        return this.api.list(this.workspace, this.page).pipe(
          catchError(error => {
            this.error = articleError(error);
            return of(null);
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(result => {
      this.result = result;
      this.loading = false;
    });
  }

  goPage(page: number): void {
    if (this.loading || page < 1) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }
}
