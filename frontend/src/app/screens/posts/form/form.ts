import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Footer } from '../../../partials/footer/footer';
import { Sidebar } from '../../../partials/sidebar/sidebar';
import { AuthService } from '../../../services/auth.service';
import {
  PostsService,
  PostForm,
  PostErrors,
  CategoryItem,
} from '../../../services/posts-service';
import { UserRole } from '../../../models/auth-user.model';

@Component({
  selector: 'app-posts-form',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    Navbar,
    Sidebar,
    Footer,
  ],
  templateUrl: './form.html',
  styleUrls: ['./form.scss'],
})
export class PostsForm implements OnInit {

  public drawerOpen: boolean = false;
  public isLogin: boolean = false;
  public userRole: UserRole = 'ESTUDIANTE';
  public currentUserName: string = '';

  public isEditMode: boolean = false;
  public postId: number | null = null;

  public post: PostForm;
  public errors: PostErrors = {};

  public categorias: CategoryItem[] = [];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly postsService: PostsService,
  ) {
    this.post = this.postsService.esquemaPost();
  }

  ngOnInit(): void {
    this.syncAuthState();
    this.categorias = this.postsService.getCategories();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      return;
    }

    this.isEditMode = true;
    this.postId = Number(idParam);

    this.postsService.getPostByIdApi(this.postId)
    .subscribe({

      next: (foundPost) => {

        this.post = {
          id: foundPost.id,
          titulo: foundPost.title,
          contenido: foundPost.content,
          categoriaId: foundPost.categoria?.id ?? null,
          etiquetas: foundPost.etiquetas,
          estado: foundPost.estado,
        };

      },

      error: (error) => {

        console.error(error);

        this.router.navigate(['/posts']);

      }

    });
  }

  public toggleSidebar(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  public closeSidebar(): void {
    this.drawerOpen = false;
  }

  public goBack(): void {
    if (this.isEditMode && this.postId) {
      this.router.navigate(['/posts', this.postId]);
      return;
    }

    this.router.navigate(['/posts']);
  }

  public guardar(): void {
    this.errors = this.postsService.validarPost(this.post);

    if (Object.keys(this.errors).length > 0) {
      return;
    }

    if (this.isEditMode && this.postId) {

      const backendPayload = {
        title: this.post.titulo.trim(),
        content: this.post.contenido.trim(),
        categoria_id: this.post.categoriaId,
        etiquetas: this.post.etiquetas ?? '',
        estado: this.post.estado ?? 'PUBLICADO',
        author_id: Number(this.authService.getUserId()),
      };

      this.postsService.updatePostApi(this.postId, backendPayload)
      .subscribe({
        next: (response) => {

            console.log('POST ACTUALIZADO');
            console.log(response);

            this.router.navigate(['/posts', this.postId]);
        },
        error: (error) => {
            console.error('ERROR actualizando post:', error);
            console.error(error.error);
            alert('Hubo un error al actualizar el post. Por favor, intenta nuevamente =(.');
        }
      });
      return;
    }

    const userId = this.authService.getUserId();

    console.log('USER ID:', userId);
    console.log('TIPO:', typeof userId);

    const backendPayload = {
      title: this.post.titulo.trim(),
      content: this.post.contenido.trim(),
      categoria_id: this.post.categoriaId,
      etiquetas: this.post.etiquetas ?? '',
      estado: this.post.estado ?? 'PUBLICADO',
      author_id: Number(userId),
    };

    console.log('Payload:', backendPayload);

    this.postsService.createPostApi(backendPayload)
      .subscribe({
        next: (response) => {

            console.log('POST EXITOSO');
            console.log('Post creado:', response);
            this.router.navigate(['/posts']);
        },

        error: (error) => {
            console.error('ERROR creando post:', error);
            console.error(error.error);
            alert('Hubo un error al crear el post. Por favor, intenta nuevamente =(.');
        }
      });
  }

  public limpiar(): void {
    this.post = this.postsService.esquemaPost();
    this.errors = {};
  }

  private syncAuthState(): void {
    this.isLogin = this.authService.isAuthenticated();
    this.userRole = this.authService.getUserRole() ?? 'ESTUDIANTE';
    this.currentUserName = this.authService.getUserName();
  }
}
