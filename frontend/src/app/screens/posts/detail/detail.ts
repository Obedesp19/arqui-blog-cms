import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Footer } from '../../../partials/footer/footer';
import { Sidebar } from '../../../partials/sidebar/sidebar';
import { AuthService } from '../../../services/auth.service';
import {
  CategoryItem,
  CommentItem,
  PostDetailItem,
  PostsService,
} from '../../../services/posts-service';
import { ReportsService } from '../../../services/reports-service';
import { UserRole } from '../../../models/auth-user.model';
import { ConfirmDeletePostModal } from '../../../modals/confirm-delete-post-modal/confirm-delete-post-modal';
import { ConfirmDeleteCommentModal } from '../../../modals/confirm-delete-comment-modal/confirm-delete-comment-modal';
import { ReportPostModal } from '../../../modals/report-post-modal/report-post-modal';
import { ReportCommentModal } from '../../../modals/report-comment-modal/report-comment-modal';

@Component({
  selector: 'app-posts-detail',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    Navbar,
    Sidebar,
    Footer
  ],
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss'],
})
export class PostsDetail implements OnInit {
  public drawerOpen: boolean = false;
  public isLogin: boolean = false;
  public userRole: UserRole = 'ESTUDIANTE';
  public currentUserName: string = '';

  public postId: number = 0;
  public post: PostDetailItem | null = null;
  public categoriaNombre: string = '';
  public newComment: string = '';
  public commentError: string = '';

  public categories: CategoryItem[] = [];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly postsService: PostsService,
    private readonly reportsService: ReportsService,
  ) {}

  ngOnInit(): void {
    this.syncAuthState();
    this.categories = this.postsService.getCategories();

    const idParam = this.route.snapshot.paramMap.get('id');
    this.postId = Number(idParam ?? 0);

    this.loadPost();
  }

  public toggleSidebar(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  public closeSidebar(): void {
    this.drawerOpen = false;
  }

  public goBack(): void {
    this.router.navigate(['/posts']);
  }

  public goEditPost(): void {
    if (!this.post || !this.canEditCurrentPost) {
      return;
    }

    this.router.navigate(['/posts/form', this.postId]);
  }

  public addComment(): void {
    this.commentError = '';

    const result = this.postsService.addComment(
      this.postId,
      this.newComment,
      this.currentUserName || 'Usuario'
    );

    if (!result.ok) {
      this.commentError = result.error ?? 'No se pudo agregar el comentario.';
      return;
    }

    this.newComment = '';
    this.loadPost();
  }

  public reportarPublicacion(): void {
    if (!this.post || !this.canReportContent) {
      return;
    }

    const ref = this.dialog.open(ReportPostModal, {
      width: '520px',
      data: {
        titulo: this.post.titulo,
      },
    });

    ref.afterClosed().subscribe((result) => {
      if (!result || !this.post) {
        return;
      }

this.reportsService.createReport(
  {
    tipo: 'POST',
    referenciaId: this.post.id,
    postId: this.post.id,
    motivo: result.motivo,
    descripcion: this.post.titulo,
    estado: 'PENDIENTE',
  },
  this.currentUserName || 'Usuario'
);
    });
  }

  public reportarComentario(comment: CommentItem): void {
    if (!this.post || !this.canReportContent) {
      return;
    }

    const ref = this.dialog.open(ReportCommentModal, {
      width: '520px',
      data: {
        autor: comment.autor,
        contenido: comment.contenido,
      },
    });

    ref.afterClosed().subscribe((result) => {
      if (!result || !this.post) {
        return;
      }

this.reportsService.createReport(
  {
    tipo: 'COMENTARIO',
    referenciaId: comment.id,
    postId: this.post.id,
    motivo: result.motivo,
    descripcion: comment.contenido,
    estado: 'PENDIENTE',
  },
  this.currentUserName || 'Usuario'
);
    });
  }

  public eliminarComentario(comment: CommentItem): void {
    if (!this.post || !this.canDeleteComment(comment)) {
      return;
    }

    const ref = this.dialog.open(ConfirmDeleteCommentModal, {
      width: '500px',
      data: {
        autor: comment.autor,
        contenido: comment.contenido,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.postsService.deleteComment(this.postId, comment.id);
        this.loadPost();
      }
    });
  }

  public eliminarPublicacion(): void {
    if (!this.post || !this.canEditCurrentPost) {
      return;
    }

    const ref = this.dialog.open(ConfirmDeletePostModal, {
      width: '500px',
      data: {
        titulo: this.post.titulo,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.postsService.deletePost(this.postId).subscribe({
          next: () => {
            this.router.navigate(['/posts']);
          },
          error: (err) => {
            console.error('Error eliminando publicación:', err);
          }
        });
      }
    });
  }

  public getEstadoClase(estado: string): string {
    switch (estado) {
      case 'PUBLICADO':
        return 'posts-detail__status--published';
      case 'BORRADOR':
        return 'posts-detail__status--draft';
      case 'ARCHIVADO':
        return 'posts-detail__status--archived';
      default:
        return '';
    }
  }

  public getTags(): string[] {
    if (!this.post?.etiquetas.trim()) {
      return [];
    }

    return this.post.etiquetas
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  public isOwner(post: PostDetailItem): boolean {
    if (!this.currentUserName.trim()) {
      return false;
    }

    return post.autor.trim().toLowerCase() === this.currentUserName.trim().toLowerCase();
  }

  public isCommentOwner(comment: CommentItem): boolean {
    if (!this.currentUserName.trim()) {
      return false;
    }

    return comment.autor.trim().toLowerCase() === this.currentUserName.trim().toLowerCase();
  }

  public canDeleteComment(comment: CommentItem): boolean {
    return this.canManagePosts || this.isCommentOwner(comment);
  }

  public get canEditCurrentPost(): boolean {
    if (!this.post) {
      return false;
    }

    return this.canManagePosts || this.isOwner(this.post);
  }

  public get canManagePosts(): boolean {
    return this.userRole === 'PROFESOR' || this.userRole === 'ADMINISTRADOR';
  }

  public get canReportContent(): boolean {
    return this.isLogin;
  }

  private syncAuthState(): void {
    this.isLogin = this.authService.isAuthenticated();
    this.userRole = this.authService.getUserRole() ?? 'ESTUDIANTE';
    this.currentUserName = this.authService.getUserName();
  }

  private loadPost(): void {
    
    this.postsService.getPostByIdApi(this.postId)
      .subscribe({

        next: (response) => {

          console.log('Post detalle:', response);

          this.post = {
            id: response.id,
            titulo: response.title,
            contenido: response.content,
            autor:
              `${response.author.first_name} ${response.author.last_name}`,
            fecha: response.creation,
            categoriaId: response.categoria?.id ?? 0,
            etiquetas: response.etiquetas ?? '',
            estado: response.estado ?? 'PUBLICADO',
            comentarios: []
          };

          this.categoriaNombre = 'General';

        },

        error: (error) => {

          console.error('Error cargando detalle:', error);

          this.router.navigate(['/posts']);

        }

      });
  }
}
