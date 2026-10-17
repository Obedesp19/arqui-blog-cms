import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Sidebar } from '../../../partials/sidebar/sidebar';
import { Footer } from '../../../partials/footer/footer';
import { AuthService } from '../../../services/auth.service';
import {
  CategoriesApiService,
  CategoryPage,
  categoryErrors,
} from '../../../services/categories-api.service';
import {
  CategoryItem,
  CategoryStatus,
} from '../../../shared/interfaces/categories.interface';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [...SHARED_IMPORTS, RouterLink, Navbar, Sidebar, Footer],
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
})
export class CategoriesList implements OnInit {
  public readonly auth = inject(AuthService);

  private readonly api = inject(CategoriesApiService);
  private readonly destroyRef = inject(DestroyRef);

  public drawerOpen = false;
  public loading = false;
  public savingId: number | null = null;
  public error = '';
  public success = '';
  public page = 1;
  public result: CategoryPage | null = null;

  public get busy(): boolean {
    return this.loading || this.savingId !== null;
  }

  public get canManage(): boolean {
    return this.auth.hasRole(['EDITOR', 'ADMINISTRADOR']);
  }

  public ngOnInit(): void {
    this.loadPage(1);
  }

  public loadPage(page: number): void {
    if (this.busy || !Number.isInteger(page) || page < 1) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';
    this.result = null;

    this.api.list(page)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: (result) => {
          this.result = result;
          this.page = page;
        },
        error: (error: unknown) => {
          this.error = this.errorMessage(error);
        },
      });
  }

  public changeStatus(category: CategoryItem): void {
    if (this.busy || !this.canManage) {
      return;
    }

    const estado: CategoryStatus =
      category.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    const action = estado === 'ACTIVO' ? 'reactivar' : 'desactivar';

    if (!window.confirm(`¿Quieres ${action} "${category.nombre}"?`)) {
      return;
    }

    this.savingId = category.id;
    this.error = '';
    this.success = '';

    this.api.setStatus(category.id, estado)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.savingId = null;
        }),
      )
      .subscribe({
        next: (updated) => {
          if (this.result) {
            this.result = {
              ...this.result,
              results: this.result.results.map((item) =>
                item.id === updated.id ? updated : item,
              ),
            };
          }

          this.success =
            `La categoría "${updated.nombre}" quedó ${updated.estado}.`;
        },
        error: (error: unknown) => {
          this.error = this.errorMessage(error);
        },
      });
  }

  private errorMessage(error: unknown): string {
    return Object.values(categoryErrors(error))
      .filter(Boolean)
      .join(' ');
  }
}