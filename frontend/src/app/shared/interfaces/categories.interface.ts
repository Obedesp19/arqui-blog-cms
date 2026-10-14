export type CategoryStatus = 'ACTIVO' | 'INACTIVO';

export interface CategoryItem {
  id: number;
  nombre: string;
  descripcion: string;
  estado: CategoryStatus;
}

export interface CategoryForm {
  id?: number | null;
  nombre: string;
  descripcion: string;
  estado: CategoryStatus | '';
}

export interface CategoryErrors {
  nombre?: string;
  descripcion?: string;
  estado?: string;
  general?: string;
}
