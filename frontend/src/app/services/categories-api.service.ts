import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CategoryErrors,
  CategoryForm,
  CategoryItem,
  CategoryStatus,
} from '../shared/interfaces/categories.interface';

export interface CategoryPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: CategoryItem[];
}

@Injectable({
  providedIn: 'root',
})
export class CategoriesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.url_api.replace(/\/+$/, '');

  public list(page: number): Observable<CategoryPage> {
    return this.http.get<CategoryPage>(
      `${this.base}/workspace/categories/`,
      { params: { page } },
    );
  }

    public activeCategories(): Observable<CategoryItem[]> {
    const getPage = (page: number) =>
      this.http.get<CategoryPage>(
        `${this.base}/categories/`,
        { params: { page } },
      ).pipe(
        map((data) => ({ data, page })),
      );

    return getPage(1).pipe(
      expand(({ data, page }) =>
        data.next ? getPage(page + 1) : EMPTY,
      ),
      reduce(
        (items: CategoryItem[], { data }) =>
          [...items, ...data.results],
        [],
      ),
    );
  }

  public get(id: number): Observable<CategoryItem> {
    return this.http.get<CategoryItem>(
      `${this.base}/workspace/categories/${id}/`,
    );
  }

  public create(form: CategoryForm): Observable<CategoryItem> {
    return this.http.post<CategoryItem>(
      `${this.base}/categories/`,
      this.payload(form),
    );
  }

  public update(
    id: number,
    form: CategoryForm,
  ): Observable<CategoryItem> {
    return this.http.patch<CategoryItem>(
      `${this.base}/categories/${id}/`,
      this.payload(form),
    );
  }

  public setStatus(
    id: number,
    estado: CategoryStatus,
  ): Observable<CategoryItem> {
    return this.http.patch<CategoryItem>(
      `${this.base}/categories/${id}/`,
      { estado },
    );
  }

  private payload(form: CategoryForm) {
    return {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      estado: form.estado,
    };
  }
}

function messages(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(messages).filter(Boolean).join(' ');
  }

  if (value !== null && typeof value === 'object') {
    return Object.values(value).map(messages).filter(Boolean).join(' ');
  }

  return '';
}

export function categoryErrors(error: unknown): CategoryErrors {
  if (!(error instanceof HttpErrorResponse)) {
    return { general: 'Ocurrió un error inesperado.' };
  }

  if (error.status === 0) {
    return { general: 'No se pudo conectar con el servidor.' };
  }

  if (error.status === 401) {
    return { general: 'Tu sesión venció. Inicia sesión nuevamente.' };
  }

  if (error.status === 403) {
    return { general: 'Esta operación requiere EDITOR o ADMINISTRADOR.' };
  }

  if (error.status === 404) {
    return { general: 'No se encontró la categoría o la página solicitada.' };
  }

  if (error.status === 400) {
    const body: unknown = error.error;
    const result: CategoryErrors = {};

    if (body !== null && typeof body === 'object' && !Array.isArray(body)) {
      const fields = body as Record<string, unknown>;

      for (const key of ['nombre', 'descripcion', 'estado'] as const) {
        const message = messages(fields[key]);
        if (message) {
          result[key] = message;
        }
      }
    }

    if (Object.keys(result).length === 0) {
      result.general = messages(body) || 'Revisa los datos enviados.';
    }

    return result;
  }

  return { general: 'No se pudo completar la operación. Intenta nuevamente.' };
}