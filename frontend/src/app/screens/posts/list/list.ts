import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Footer } from '../../../partials/footer/footer';
import { Sidebar } from '../../../partials/sidebar/sidebar';
import { AuthService } from '../../../services/auth.service';
import { PostsService, PostListItem } from '../../../services/posts-service';
import { ReportsService } from '../../../services/reports-service';
import { UserRole } from '../../../models/auth-user.model';
import { ReportPostModal } from '../../../modals/report-post-modal/report-post-modal';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    Navbar,
    Sidebar,
    Footer,
  ],
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
})
export class PostsList implements OnInit {
  public drawerOpen: boolean = false;
  public isLogin: boolean = false;
  public userRole: UserRole = 'ESTUDIANTE';
  public currentUserName: string = '';

  public search: string = '';
  public selectedCategory: string = 'TODAS';

  public categories: string[] = ['TODAS'];
  public page: number = 1;
  public pageSize: number = 6;

  public posts: PostListItem[] = [];

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly postsService: PostsService,
    private readonly reportsService: ReportsService,
  ) {}

  ngOnInit(): void {
    this.syncAuthState();
    this.loadPosts();
  }

  public toggleSidebar(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  public closeSidebar(): void {
    this.drawerOpen = false;
  }

  public goCreatePost(): void {
    if (!this.isLogin) {
      this.router.navigate(['/login'], {
        queryParams: { redirectTo: '/posts/form' },
      });
      return;
    }

    this.router.navigate(['/posts/form']);
  }

  public goPostDetail(postId: number): void {
    this.router.navigate(['/posts', postId]);
  }

  public goEditPost(postId: number): void {
    this.router.navigate(['/posts/form', postId]);
  }

  public goLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { redirectTo: '/posts' },
    });
  }

  public reportarPost(postId: number): void {
    const post = this.posts.find((item) => item.id === postId);

    if (!post) {
      return;
    }

    if (!this.canReportPosts) {
      this.goLogin();
      return;
    }

    const ref = this.dialog.open(ReportPostModal, {
      width: '520px',
      data: {
        titulo: post.titulo,
      },
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.reportsService.createReport(
        {
          tipo: 'POST',
          referenciaId: post.id,
          postId: post.id,
          motivo: result.motivo,
          descripcion: post.titulo,
          estado: 'PENDIENTE',
        },
        this.currentUserName || 'Usuario'
      );
    });
  }

  public isOwner(post: PostListItem): boolean {
    if (!this.currentUserName.trim()) {
      return false;
    }

    return post.autor.trim().toLowerCase() === this.currentUserName.trim().toLowerCase();
  }

  public canEditPost(post: PostListItem): boolean {
    return this.canManagePosts || this.isOwner(post);
  }

  public onSearchChange(): void {
    this.page = 1;
  }

  public onCategoryChange(): void {
    this.page = 1;
  }

  public prevPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  public nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  public get filteredPosts(): PostListItem[] {
    return this.posts.filter((post) => {
      const text = this.search.trim().toLowerCase();

      const matchesSearch =
        !text ||
        post.titulo.toLowerCase().includes(text) ||
        post.contenido.toLowerCase().includes(text) ||
        post.autor.toLowerCase().includes(text);

      const matchesCategory =
        this.selectedCategory === 'TODAS' ||
        post.categoria === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  public get paginatedPosts(): PostListItem[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredPosts.slice(start, start + this.pageSize);
  }

  public get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPosts.length / this.pageSize));
  }

  public get canManagePosts(): boolean {
    return this.userRole === 'PROFESOR' || this.userRole === 'ADMINISTRADOR';
  }

  public get canCreatePost(): boolean {
    return this.isLogin;
  }

  public get canReportPosts(): boolean {
    return this.isLogin;
  }

  public get isPublicView(): boolean {
    return !this.isLogin;
  }

  private syncAuthState(): void {
    this.isLogin = this.authService.isAuthenticated();
    this.userRole = this.authService.getUserRole() ?? 'ESTUDIANTE';
    this.currentUserName = this.authService.getUserName();
  }

  private loadPosts(): void {

    this.postsService.getPostsApi()
      .subscribe({

        next: (response) => {
          console.log(response);

          const postsArray = response.results ?? response;

          this.posts = postsArray.map((post: any) => ({

            id: post.id,
            titulo: post.title,
            contenido: post.content,
            autor: `${post.author.first_name} ${post.author.last_name}`,
            fecha: post.creation,
            categoria: post.categoria?.nombre ?? 'Sin categoría',
            comentarios: 0

          }));

        },

        error: (error) => {

          console.error('Error cargando posts:', error);

        }

      });
  }
}
