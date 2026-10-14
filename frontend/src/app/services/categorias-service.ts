import { Injectable } from '@angular/core';
import {
  CategoryErrors,
  CategoryForm,
  CategoryItem,
} from '../shared/interfaces/categories.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private categories: CategoryItem[] = [
    { id: 1, nombre: 'Programación', descripcion: 'Desarrollo, frontend, backend y buenas prácticas.', estado: 'ACTIVO' },
    { id: 2, nombre: 'Matemáticas', descripcion: 'Álgebra, cálculo, probabilidad y apoyo teórico.', estado: 'ACTIVO' },
    { id: 3, nombre: 'Inteligencia Artificial', descripcion: 'ML, DL, clasificación y aplicaciones.', estado: 'ACTIVO' },
    { id: 4, nombre: 'Bases de Datos', descripcion: 'Modelado, SQL, normalización y administración.', estado: 'ACTIVO' },
    { id: 5, nombre: 'Redes', descripcion: 'Subnetting, VLANs, switching y routing.', estado: 'ACTIVO' },
  ];

  public esquemaCategoria(): CategoryForm {
    return {
      id: null,
      nombre: '',
      descripcion: '',
      estado: 'ACTIVO',
    };
  }

  public getAllCategories(includeInactive = true): CategoryItem[] {
    const rows = includeInactive ? this.categories : this.categories.filter(c => c.estado === 'ACTIVO');
    return [...rows].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  public getCategoryById(id: number): CategoryItem | null {
    const found = this.categories.find(c => c.id === id);
    return found ? { ...found } : null;
  }

  public validarCategoria(form: CategoryForm, existingId?: number): CategoryErrors {
    const errors: CategoryErrors = {};
    const nombre = form.nombre.trim();
    const descripcion = form.descripcion.trim();

    if (!nombre) {
      errors.nombre = 'El nombre es obligatorio.';
    } else if (nombre.length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres.';
    } else if (nombre.length > 80) {
      errors.nombre = 'El nombre no puede exceder 80 caracteres.';
    } else {
      const duplicate = this.categories.find(
        c => c.nombre.trim().toLowerCase() === nombre.toLowerCase() && c.id !== existingId
      );
      if (duplicate) {
        errors.nombre = 'Ya existe una categoría con ese nombre.';
      }
    }

    if (!descripcion) {
      errors.descripcion = 'La descripción es obligatoria.';
    } else if (descripcion.length < 10) {
      errors.descripcion = 'La descripción debe tener al menos 10 caracteres.';
    } else if (descripcion.length > 240) {
      errors.descripcion = 'La descripción no puede exceder 240 caracteres.';
    }

    if (form.estado !== 'ACTIVO' && form.estado !== 'INACTIVO') {
      errors.estado = 'Debes seleccionar un estado válido.';
    }

    return errors;
  }

  public createCategory(form: CategoryForm): { ok: true; id: number } | { ok: false; errors: CategoryErrors } {
    const errors = this.validarCategoria(form);
    if (Object.keys(errors).length > 0) {
      return { ok: false, errors };
    }

    const id = this.categories.length ? Math.max(...this.categories.map(c => c.id)) + 1 : 1;
    this.categories.push({
      id,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      estado: form.estado as 'ACTIVO' | 'INACTIVO',
    });

    return { ok: true, id };
  }

  public updateCategory(id: number, form: CategoryForm): { ok: true } | { ok: false; errors: CategoryErrors } {
    const idx = this.categories.findIndex(c => c.id === id);
    if (idx === -1) {
      return { ok: false, errors: { general: 'Categoría no encontrada.' } };
    }

    const errors = this.validarCategoria(form, id);
    if (Object.keys(errors).length > 0) {
      return { ok: false, errors };
    }

    this.categories[idx] = {
      id,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      estado: form.estado as 'ACTIVO' | 'INACTIVO',
    };

    return { ok: true };
  }

  public inactivateCategory(id: number): boolean {
    const idx = this.categories.findIndex(c => c.id === id);
    if (idx === -1) {
      return false;
    }
    this.categories[idx] = { ...this.categories[idx], estado: 'INACTIVO' };
    return true;
  }
}
