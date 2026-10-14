import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Footer } from '../../../partials/footer/footer';
import { PostsService } from '../../../services/posts-service';
import { PostForm } from '../../../services/posts-service';
import { Sidebar } from "../../../partials/sidebar/sidebar";

type UserRole = 'ESTUDIANTE' | 'PROFESOR' | 'ADMINISTRADOR';

interface CategoryItem {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-posts-edit',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    Navbar,
    Sidebar,
    Footer,
    Sidebar
],
  templateUrl: './edit.html',
  styleUrls: ['./edit.scss'],
})
export class PostsEdit implements OnInit {
  public drawerOpen = false;
  public userRole: UserRole = 'ADMINISTRADOR';

  public postId: number | null = null;

  public titulo: string = '';
  public contenido: string = '';
  public categoriaId: number | null = null;
  public etiquetas: string = '';
  public estado: string = 'PUBLICADO';

  public errors: any = {};

  public categories: CategoryItem[] = [
    { id: 1, nombre: 'Programación' },
    { id: 2, nombre: 'Matemáticas' },
    { id: 3, nombre: 'Inteligencia Artificial' },
    { id: 4, nombre: 'Bases de Datos' },
    { id: 5, nombre: 'Redes' },
  ];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly postsService: PostsService
  ) {}

  ngOnInit(): void {
    const savedRole = localStorage.getItem('userRole') as UserRole | null;

    if (
      savedRole === 'ESTUDIANTE' ||
      savedRole === 'PROFESOR' ||
      savedRole === 'ADMINISTRADOR'
    ) {
      this.userRole = savedRole;
    }

    this.postId = this.obtenerIdDesdeRuta();
    this.cargarPost();
  }

  /* =========================
     UI
     ========================= */
  public toggleSidebar(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  public closeSidebar(): void {
    this.drawerOpen = false;
  }

  public goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  public goBack(): void {
    this.router.navigate(['/posts']);
  }

  /* =========================
     Acciones
     ========================= */
  public guardarBorrador(): void {
    this.estado = 'BORRADOR';
    this.submit();
  }

  public publicar(): void {
    this.estado = 'PUBLICADO';
    this.submit();
  }

    public guardarCambios(): void {
    this.submit();
  }

  public submit(): void {
    const post = this.obtenerPostDesdeFormulario();

    this.errors = this.postsService.validarPost(post);

    if (Object.keys(this.errors).length > 0) {
      return;
    }

    const payload = {
      id: this.postId,
      titulo: post.titulo.trim(),
      contenido: post.contenido.trim(),
      categoriaId: post.categoriaId,
      etiquetas: post.etiquetas.trim(),
      estado: post.estado,
    };

    console.log('Post editado a enviar al backend después:', payload);

    localStorage.setItem('lastEditedPostDraft', JSON.stringify(payload));
    this.router.navigate(['/posts']);
  }

  /* =========================
     Helpers
     ========================= */
  private obtenerIdDesdeRuta(): number | null {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) return null;

    const id = Number(idParam);
    return Number.isNaN(id) ? null : id;
  }

  private cargarEsquemaPost(): void {
    const esquema = this.postsService.esquemaPost();

    this.titulo = esquema.titulo;
    this.contenido = esquema.contenido;
    this.categoriaId = esquema.categoriaId;
    this.etiquetas = esquema.etiquetas;
    this.estado = esquema.estado;
  }

  private cargarPost(): void {
    this.cargarEsquemaPost();

    const postsMock: PostForm[] = [
      {
        id: 1,
        titulo: 'Introducción a Angular',
        contenido: 'En este post revisamos los conceptos básicos de Angular, componentes, templates y servicios.',
        categoriaId: 1,
        etiquetas: 'angular,frontend,typescript',
        estado: 'PUBLICADO',
      },
      {
        id: 2,
        titulo: 'Consultas SQL básicas',
        contenido: 'Este material explica select, where, order by y los fundamentos para comenzar con bases de datos.',
        categoriaId: 4,
        etiquetas: 'sql,basesdedatos',
        estado: 'BORRADOR',
      },
      {
        id: 3,
        titulo: 'Conceptos introductorios de redes',
        contenido: 'Aquí se describen los conceptos principales sobre redes, topologías y modelos de comunicación.',
        categoriaId: 5,
        etiquetas: 'redes,protocolos',
        estado: 'PUBLICADO',
      },
    ];

    const encontrado = postsMock.find((item) => item.id === this.postId);

    if (!encontrado) {
      this.router.navigate(['/posts']);
      return;
    }

    this.titulo = encontrado.titulo;
    this.contenido = encontrado.contenido;
    this.categoriaId = encontrado.categoriaId;
    this.etiquetas = encontrado.etiquetas;
    this.estado = encontrado.estado;
  }

  private obtenerPostDesdeFormulario(): PostForm {
    return {
      id: this.postId,
      titulo: this.titulo,
      contenido: this.contenido,
      categoriaId: this.categoriaId,
      etiquetas: this.etiquetas,
      estado: this.estado,
    };
  }

  /* =========================
     Permisos
     ========================= */
  public get canEditPost(): boolean {
    return (
      this.userRole === 'PROFESOR' ||
      this.userRole === 'ADMINISTRADOR'
    );
  }
}
