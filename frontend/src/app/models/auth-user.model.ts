export type UserRole = 'ESTUDIANTE' | 'PROFESOR' | 'ADMINISTRADOR';

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
}
