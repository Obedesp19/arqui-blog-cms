import { Injectable } from '@angular/core';
import { ValidatorService } from './tools/validator-service';
import { ErrorsService } from './tools/errors-service';
import { CategoriesService } from './categorias-service';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PostForm,
  PostErrors,
  PostEstado,
  PostListItem,
  PostDetailItem,
  CommentItem,
  CategoryItem,
} from '../shared/interfaces/posts.interface';

export type {
  PostForm,
  PostErrors,
  PostEstado,
  PostListItem,
  PostDetailItem,
  CommentItem,
  CategoryItem,
};

@Injectable({
  providedIn: 'root',
})
export class PostsService {

  private apiUrl = 'http://127.0.0.1:8000/posts/';

  private posts: PostDetailItem[] = [
    {
      id: 1,
      titulo: '¿Cómo empezar con Angular?',
      contenido:
        'Quiero conocer una ruta clara para comenzar a trabajar con Angular desde cero. Me interesa saber qué temas debo estudiar primero, cómo organizar mi aprendizaje y qué recomendaciones prácticas podrían ayudarme a construir proyectos reales desde las bases hasta temas más avanzados.',
      categoriaId: 1,
      etiquetas: 'angular, frontend, rutas',
      estado: 'PUBLICADO',
      autor: 'Ana López',
      fecha: '22/03/2026',
      comentarios: [
        {
          id: 1,
          autor: 'Carlos Pérez',
          contenido: 'Te recomiendo empezar por componentes, rutas y servicios antes de pasar a estado global.',
          fecha: '23/03/2026',
        },
      ],
    },
    {
      id: 2,
      titulo: 'Dudas sobre normalización en bases de datos',
      contenido:
        'Tengo dudas con primera, segunda y tercera forma normal para un proyecto escolar. Quisiera entender cómo identificar dependencias y cuándo dividir tablas.',
      categoriaId: 4,
      etiquetas: 'sql, normalizacion, modelo-relacional',
      estado: 'BORRADOR',
      autor: 'Carlos Pérez',
      fecha: '21/03/2026',
      comentarios: [],
    },
    {
      id: 3,
      titulo: 'Recursos para aprender redes',
      contenido:
        'Compartan libros, videos o prácticas para entender mejor subnetting, VLANs y configuración básica de switches.',
      categoriaId: 5,
      etiquetas: 'redes, subnetting, vlan',
      estado: 'PUBLICADO',
      autor: 'María Torres',
      fecha: '20/03/2026',
      comentarios: [],
    },
    {
      id: 4,
      titulo: 'Aplicaciones de IA en educación',
      contenido:
        'Me interesa debatir cómo se puede usar la inteligencia artificial en contextos académicos, qué ventajas puede traer y qué riesgos existen.',
      categoriaId: 3,
      etiquetas: 'ia, educacion, tecnologia',
      estado: 'ARCHIVADO',
      autor: 'Luis Ramírez',
      fecha: '19/03/2026',
      comentarios: [],
    },
    {
      id: 5,
      titulo: 'Buenas prácticas para diseñar APIs REST',
      contenido:
        'Estoy construyendo una API para un proyecto escolar y quiero saber cómo organizar endpoints, respuestas, códigos HTTP y validaciones.',
      categoriaId: 1,
      etiquetas: 'api, backend, rest',
      estado: 'PUBLICADO',
      autor: 'Jorge Medina',
      fecha: '18/03/2026',
      comentarios: [],
    },
    {
      id: 6,
      titulo: 'Modelo entidad-relación para control escolar',
      contenido:
        'Necesito ayuda para modelar alumnos, docentes, materias, grupos, calificaciones e inscripciones evitando redundancia.',
      categoriaId: 4,
      etiquetas: 'base-de-datos, er, sql',
      estado: 'PUBLICADO',
      autor: 'Fernanda Ruiz',
      fecha: '17/03/2026',
      comentarios: [],
    },
    {
      id: 7,
      titulo: 'Subnetting rápido para examen',
      contenido:
        'Estoy practicando subnetting y me gustaría conocer un método rápido para calcular subredes, máscaras y broadcast.',
      categoriaId: 5,
      etiquetas: 'redes, subnetting, ccna',
      estado: 'PUBLICADO',
      autor: 'Héctor Ramírez',
      fecha: '16/03/2026',
      comentarios: [],
    },
    {
      id: 8,
      titulo: 'Álgebra lineal aplicada a Machine Learning',
      contenido:
        'Quiero entender por qué matrices, vectores, producto punto y transformaciones lineales son importantes para machine learning.',
      categoriaId: 2,
      etiquetas: 'matematicas, machine-learning, algebra-lineal',
      estado: 'PUBLICADO',
      autor: 'María Castillo',
      fecha: '15/03/2026',
      comentarios: [],
    },
    {
      id: 9,
      titulo: 'CRUD completo con Angular y servicios',
      contenido:
        'Estoy haciendo un CRUD en Angular y quiero organizarlo correctamente usando componentes, servicios, modelos, rutas y guards.',
      categoriaId: 1,
      etiquetas: 'angular, crud, servicios',
      estado: 'PUBLICADO',
      autor: 'Diana Flores',
      fecha: '14/03/2026',
      comentarios: [],
    },
    {
      id: 10,
      titulo: 'Regresión lineal explicada desde cero',
      contenido:
        'Busco una explicación sencilla de regresión lineal, función de costo, pendiente, intercepto y ajuste de parámetros.',
      categoriaId: 3,
      etiquetas: 'ia, regresion-lineal, machine-learning',
      estado: 'PUBLICADO',
      autor: 'Eduardo Vega',
      fecha: '13/03/2026',
      comentarios: [],
    },
    {
      id: 11,
      titulo: 'Diferencia entre programación orientada a objetos y funcional',
      contenido:
        'Quiero comparar programación orientada a objetos y programación funcional con ejemplos claros, ventajas y casos de uso.',
      categoriaId: 1,
      etiquetas: 'poo, funcional, paradigmas',
      estado: 'PUBLICADO',
      autor: 'Luis Herrera',
      fecha: '12/03/2026',
      comentarios: [],
    },
    {
      id: 12,
      titulo: 'Cómo preparar una exposición técnica clara',
      contenido:
        'Necesito consejos para explicar un tema técnico frente al grupo sin saturar diapositivas y manteniendo una estructura comprensible.',
      categoriaId: 1,
      etiquetas: 'exposicion, comunicacion, universidad',
      estado: 'PUBLICADO',
      autor: 'Valeria Ruiz',
      fecha: '11/03/2026',
      comentarios: [],
    },
  ];

  constructor(
    private readonly validadorService: ValidatorService,
    private readonly errorsService: ErrorsService,
    private readonly categoriesService: CategoriesService,
    private readonly http: HttpClient
  ) {}

  public esquemaPost(): PostForm {
    return {
      id: null,
      titulo: '',
      contenido: '',
      categoriaId: null,
      etiquetas: '',
      estado: 'BORRADOR',
    };
  }

  public getCategories(): CategoryItem[] {
    return this.categoriesService.getAllCategories(false).map((category) => ({
      id: category.id,
      nombre: category.nombre,
    }));
  }

  public getPostById(id: number): PostDetailItem | null {
    const post = this.posts.find((item) => item.id === id);

    if (!post) {
      return null;
    }

    return {
      ...post,
      comentarios: [...post.comentarios],
    };
  }

  public getAllPosts(): PostListItem[] {
    return this.mapToListItems(this.posts);
  }

  public getPublicPosts(): PostListItem[] {
    return this.mapToListItems(
      this.posts.filter((post) => post.estado === 'PUBLICADO')
    );
  }

  public getRecentPublicPosts(limit = 4): PostListItem[] {
    return this.getPublicPosts().slice(0, limit);
  }

  public createPost(
    post: PostForm,
    autor: string
  ): { ok: boolean; errors?: PostErrors; postId?: number } {
    const errors = this.validarPost(post);

    if (Object.keys(errors).length > 0) {
      return { ok: false, errors };
    }

    const newId = this.generateId();

    const newPost: PostDetailItem = {
      id: newId,
      titulo: post.titulo.trim(),
      contenido: post.contenido.trim(),
      categoriaId: post.categoriaId as number,
      etiquetas: post.etiquetas?.trim() ?? '',
      estado: post.estado as PostEstado,
      autor: autor.trim() || 'Usuario',
      fecha: this.getCurrentDate(),
      comentarios: [],
    };

    this.posts.unshift(newPost);

    return {
      ok: true,
      postId: newId,
    };
  }

  public createPostApi(post: any): Observable<any> {
    return this.http.post(this.apiUrl, post);
  } 

  public getPostsApi(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  public getPostByIdApi(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}${id}/`);
  }

  public updatePostApi(id: number, post: any): Observable<any> {
    return this.http.put(`${this.apiUrl}${id}/`, post);
  }

  public updatePost(
    postId: number,
    post: PostForm
  ): { ok: boolean; errors?: PostErrors } {
    const errors = this.validarPost(post);

    if (Object.keys(errors).length > 0) {
      return { ok: false, errors };
    }

    const index = this.posts.findIndex((item) => item.id === postId);

    if (index === -1) {
      return {
        ok: false,
        errors: {
          titulo: 'La publicación no existe.',
        },
      };
    }

    const current = this.posts[index];

    this.posts[index] = {
      ...current,
      titulo: post.titulo.trim(),
      contenido: post.contenido.trim(),
      categoriaId: post.categoriaId as number,
      etiquetas: post.etiquetas?.trim() ?? '',
      estado: post.estado as PostEstado,
    };

    return { ok: true };
  }

  deletePost(postId: number) {
    return this.http.delete(`${this.apiUrl}${postId}/`);
  }

  public addComment(
    postId: number,
    contenido: string,
    autor: string
  ): { ok: boolean; error?: string } {
    const index = this.posts.findIndex((item) => item.id === postId);

    if (index === -1) {
      return {
        ok: false,
        error: 'La publicación no existe.',
      };
    }

    const text = contenido.trim();

    if (!text) {
      return {
        ok: false,
        error: 'El comentario es obligatorio.',
      };
    }

    if (text.length < 20) {
      return {
        ok: false,
        error: 'El comentario debe tener al menos 20 caracteres.',
      };
    }

    const newComment: CommentItem = {
      id: this.generateCommentId(this.posts[index].comentarios),
      autor: autor.trim() || 'Usuario',
      contenido: text,
      fecha: this.getCurrentDate(),
    };

    this.posts[index].comentarios.unshift(newComment);

    return { ok: true };
  }

  public deleteComment(postId: number, commentId: number): boolean {
    const postIndex = this.posts.findIndex((item) => item.id === postId);

    if (postIndex === -1) {
      return false;
    }

    const before = this.posts[postIndex].comentarios.length;

    this.posts[postIndex].comentarios =
      this.posts[postIndex].comentarios.filter((comment) => comment.id !== commentId);

    return this.posts[postIndex].comentarios.length < before;
  }

  public validarPost(post: PostForm): PostErrors {
    const errors: PostErrors = {};

    if (!post.titulo?.trim()) {
      errors.titulo = 'El título es obligatorio.';
    } else if (this.validadorService.regex(post.titulo, /^\s|\s$/)) {
      errors.titulo = 'El título no puede comenzar ni terminar con espacios.';
    } else if (!this.validadorService.minLen(post.titulo, 5)) {
      errors.titulo = 'El título debe tener al menos 5 caracteres.';
    } else if (!this.validadorService.maxLen(post.titulo, 120)) {
      errors.titulo = 'El título no puede exceder los 120 caracteres.';
    }

    if (post.categoriaId === null || post.categoriaId === undefined) {
      errors.categoriaId = 'Debes seleccionar una categoría.';
    } else {
      const exists = this.categoriesService.getCategoryById(post.categoriaId);

      if (!exists || exists.estado !== 'ACTIVO') {
        errors.categoriaId = 'La categoría seleccionada no es válida.';
      }
    }

    if (!post.contenido?.trim()) {
      errors.contenido = 'El contenido es obligatorio.';
    } else if (this.validadorService.regex(post.contenido, /^\s|\s$/)) {
      errors.contenido = 'El contenido no puede comenzar ni terminar con espacios.';
    } else if (!this.validadorService.minLen(post.contenido, 20)) {
      errors.contenido = 'El contenido debe tener al menos 20 caracteres.';
    } else if (!this.validadorService.maxLen(post.contenido, 2500)) {
      errors.contenido = 'El contenido no puede exceder los 2500 caracteres.';
    }

    if (post.etiquetas?.trim()) {
      if (this.validadorService.regex(post.etiquetas, /^\s|\s$/)) {
        errors.etiquetas = 'Las etiquetas no pueden comenzar ni terminar con espacios.';
      } else if (!this.validadorService.maxLen(post.etiquetas, 100)) {
        errors.etiquetas = 'Las etiquetas no pueden exceder los 100 caracteres.';
      }
    }

    if (!post.estado?.trim()) {
      errors.estado = 'Debes seleccionar un estado.';
    } else if (
      post.estado !== 'PUBLICADO' &&
      post.estado !== 'BORRADOR' &&
      post.estado !== 'ARCHIVADO'
    ) {
      errors.estado = 'El estado seleccionado no es válido.';
    }

    return errors;
  }

  public getTotalPosts(): number {
    return this.posts.length;
  }

  public getTotalPublishedPosts(): number {
    return this.posts.filter((post) => post.estado === 'PUBLICADO').length;
  }

  public getTotalComments(): number {
    return this.posts.reduce(
      (total, post) => total + (post.comentarios?.length ?? 0),
      0
    );
  }

  public getPostsByCategory(): { categoria: string; total: number }[] {
    const counter = new Map<string, number>();

    this.posts.forEach((post) => {
      const categoryName = this.getCategoryName(post.categoriaId);
      counter.set(categoryName, (counter.get(categoryName) ?? 0) + 1);
    });

    return Array.from(counter.entries())
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total);
  }

  public getTopPosters(): { autor: string; total: number }[] {
    const counter = new Map<string, number>();

    this.posts.forEach((post) => {
      counter.set(post.autor, (counter.get(post.autor) ?? 0) + 1);
    });

    return Array.from(counter.entries())
      .map(([autor, total]) => ({ autor, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }

  public getTrendingCategories(): { categoria: string; totalComentarios: number }[] {
    const counter = new Map<string, number>();

    this.posts.forEach((post) => {
      const categoryName = this.getCategoryName(post.categoriaId);
      counter.set(
        categoryName,
        (counter.get(categoryName) ?? 0) + (post.comentarios?.length ?? 0)
      );
    });

    return Array.from(counter.entries())
      .map(([categoria, totalComentarios]) => ({
        categoria,
        totalComentarios,
      }))
      .sort((a, b) => b.totalComentarios - a.totalComentarios)
      .slice(0, 5);
  }

  private mapToListItems(rows: PostDetailItem[]): PostListItem[] {
    return [...rows]
      .sort((a, b) => b.id - a.id)
      .map((post) => ({
        id: post.id,
        titulo: post.titulo,
        contenido: post.contenido,
        categoria: this.getCategoryName(post.categoriaId),
        autor: post.autor,
        fecha: post.fecha,
        comentarios: post.comentarios.length,
      }));
  }

  private getCategoryName(categoryId: number): string {
    return this.categoriesService.getCategoryById(categoryId)?.nombre ?? 'Sin categoría';
  }

  private generateId(): number {
    return this.posts.length > 0
      ? Math.max(...this.posts.map((item) => item.id)) + 1
      : 1;
  }

  private generateCommentId(comments: CommentItem[]): number {
    return comments.length > 0
      ? Math.max(...comments.map((item) => item.id)) + 1
      : 1;
  }

  private getCurrentDate(): string {
    return new Date().toLocaleDateString('es-MX');
  }
}
