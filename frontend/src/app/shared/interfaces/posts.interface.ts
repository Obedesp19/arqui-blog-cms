export type PostEstado = 'PUBLICADO' | 'BORRADOR' | 'ARCHIVADO';

export interface PostForm {
  id?: number | null;
  titulo: string;
  contenido: string;
  categoriaId: number | null;
  etiquetas: string;
  estado: PostEstado | string;
}

export type PostErrors = Partial<Record<keyof PostForm, string>>;

export interface PostListItem {
  id: number;
  titulo: string;
  contenido: string;
  categoria: string;
  autor: string;
  fecha: string;
  comentarios: number;
}

export interface CategoryItem {
  id: number;
  nombre: string;
}

export interface CommentItem {
  id: number;
  autor: string;
  contenido: string;
  fecha: string;
}

export interface PostDetailItem {
  id: number;
  titulo: string;
  contenido: string;
  categoriaId: number;
  etiquetas: string;
  estado: PostEstado;
  autor: string;
  fecha: string;
  comentarios: CommentItem[];
}
