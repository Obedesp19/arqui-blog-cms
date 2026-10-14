import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Footer } from '../../../partials/footer/footer';
import { PostsService } from '../../../services/posts-service';
import { PostForm } from '../../../services/posts-service';
import { Sidebar } from '../../../partials/sidebar/sidebar';

type UserRole = 'ESTUDIANTE' | 'PROFESOR' | 'ADMINISTRADOR';

interface CategoryItem {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-posts-create',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    Navbar,
    Sidebar,
    Footer,
  ],
  templateUrl: './create.html',
  styleUrls: ['./create.scss'],
})
export class PostsCreate implements OnInit {
  public drawerOpen = false;
  public userRole: UserRole = 'ESTUDIANTE';

  public titulo: string = '';
  public contenido: string = '';
  public categoriaId: number | null = null;
  public etiquetas: string = '';
  public estado: string = '';

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

    this.cargarEsquemaPost();
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

  public guardar(): void {
    this.submit();
  }

  public submit(): void {

    console.log('ENTRÓ AL SUBMIT');

    const post = this.obtenerPostDesdeFormulario();

    this.errors = this.postsService.validarPost(post);

    if (Object.keys(this.errors).length > 0) {
      return;
    }

    const backendPayload = {
      title: post.titulo.trim(),
      content: post.contenido.trim(),
      //author: 1
    };
    
    console.log('Payload:', backendPayload);

    this.postsService.createPostApi(backendPayload)
      .subscribe({

        next: (response) => {

          console.log('POST EXITOSO');
          console.log('Post creado:', response);

          window.location.href = '/posts';
        },

        error: (error) => {

          console.error('Error creando post:', error);

        }
      });
      
  }

  /* =========================
     Helpers
     ========================= */
  private cargarEsquemaPost(): void {
    const esquema = this.postsService.esquemaPost();

    this.titulo = esquema.titulo;
    this.contenido = esquema.contenido;
    this.categoriaId = esquema.categoriaId;
    this.etiquetas = esquema.etiquetas;
    this.estado = esquema.estado;
  }

  private obtenerPostDesdeFormulario(): PostForm {
    return {
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
  public get canCreatePost(): boolean {
    return (
      this.userRole === 'ESTUDIANTE' ||
      this.userRole === 'PROFESOR' ||
      this.userRole === 'ADMINISTRADOR'
    );
  }
  
}
