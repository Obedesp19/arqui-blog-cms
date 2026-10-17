import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Sidebar } from '../../../partials/sidebar/sidebar';
import { Footer } from '../../../partials/footer/footer';
import { AuthService } from '../../../services/auth.service';
import {
  CategoriesApiService,
  categoryErrors,
} from '../../../services/categories-api.service';
import {
  CategoryErrors,
  CategoryForm,
} from '../../../shared/interfaces/categories.interface';

@Component({
  selector: 'app-categories-form',
  standalone: true,
  imports: [...SHARED_IMPORTS, Navbar, Sidebar, Footer],
  templateUrl: './form.html',
  styleUrls: ['./form.scss'],
})
export class CategoriesForm implements OnInit {
  public readonly auth = inject(AuthService);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CategoriesApiService);
  private readonly destroyRef = inject(DestroyRef);

  public drawerOpen = false;
  public loading = false;
  public saving = false;
  public ready = false;
  public isEditMode = false;
  public categoryId: number | null = null;

  public form: CategoryForm = this.emptyForm();
  public errors: CategoryErrors = {};

  public get canManage(): boolean {
    return this.auth.hasRole(['EDITOR', 'ADMINISTRADOR']);
  }

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.errors = {};
          this.ready = false;
          this.loading = false;
          this.form = this.emptyForm();

          const rawId = params.get('id');
          this.isEditMode = rawId !== null;
          this.categoryId = null;

          if (rawId === null) {
            this.ready = true;
            return of(null);
          }

          const id = Number(rawId);

          if (!Number.isSafeInteger(id) || id < 1) {
            this.errors.general = 'El ID de categoría no es válido.';
            return of(null);
          }

          this.categoryId = id;
          this.loading = true;

          return this.api.get(id).pipe(
            catchError((error: unknown) => {
              this.errors = categoryErrors(error);
              return of(null);
            }),
            finalize(() => {
              this.loading = false;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((category) => {
        if (category) {
          this.form = {
            id: category.id,
            nombre: category.nombre,
            descripcion: category.descripcion,
            estado: category.estado,
          };

          this.ready = true;
        }
      });
  }

  public goBack(): void {
    this.router.navigate(['/categories']);
  }

  public save(): void {
    if (
      this.saving ||
      this.loading ||
      !this.ready ||
      !this.canManage
    ) {
      return;
    }

    this.errors = {};

    const nombre = this.form.nombre.trim();

    if (!nombre) {
      this.errors.nombre = 'El nombre es obligatorio.';
    } else if (nombre.length > 100) {
      this.errors.nombre = 'El nombre no puede exceder 100 caracteres.';
    }

    if (this.form.descripcion.trim().length > 240) {
      this.errors.descripcion =
        'La descripción no puede exceder 240 caracteres.';
    }

    if (
      this.form.estado !== 'ACTIVO' &&
      this.form.estado !== 'INACTIVO'
    ) {
      this.errors.estado = 'Selecciona un estado válido.';
    }

    if (Object.keys(this.errors).length > 0) {
      return;
    }

    if (this.isEditMode && this.categoryId === null) {
      this.errors.general = 'No se ha cargado la categoría.';
      return;
    }

    const request = this.isEditMode
      ? this.api.update(this.categoryId!, this.form)
      : this.api.create(this.form);

    this.saving = true;

    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.saving = false;
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/categories']);
        },
        error: (error: unknown) => {
          this.errors = categoryErrors(error);
        },
      });
  }

  private emptyForm(): CategoryForm {
    return {
      nombre: '',
      descripcion: '',
      estado: 'ACTIVO',
    };
  }
}