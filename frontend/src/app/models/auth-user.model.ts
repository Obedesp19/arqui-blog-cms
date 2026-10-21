export type UserRole = 'LECTOR' | 'AUTOR' | 'EDITOR' | 'ADMINISTRADOR';

export interface AuthUser {
  id: number;
  nombre: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
}