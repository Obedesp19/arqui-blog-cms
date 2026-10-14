import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../shared/shared_imports';
import { Navbar } from '../../partials/navbar/navbar';
import { Sidebar } from '../../partials/sidebar/sidebar';
import { Footer } from '../../partials/footer/footer';
import { AuthService } from '../../services/auth.service';
import { PostsService } from '../../services/posts-service';
import { CategoriesService } from '../../services/categorias-service';
import { ReportsService } from '../../services/reports-service';
import { UserRole } from '../../models/auth-user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    Navbar,
    Sidebar,
    Footer,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit {
  public drawerOpen: boolean = false;
  public isLogin: boolean = false;
  public userRole: UserRole = 'ESTUDIANTE';
  public currentUserName: string = '';

  public totalPosts: number = 0;
  public totalPublishedPosts: number = 0;
  public totalCategories: number = 0;
  public totalComments: number = 0;
  public pendingReports: number = 0;

  public postsByCategory: { categoria: string; total: number }[] = [];
  public topPosters: { autor: string; total: number }[] = [];
  public trendingCategories: { categoria: string; totalComentarios: number }[] = [];

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly postsService: PostsService,
    private readonly categoriesService: CategoriesService,
    private readonly reportsService: ReportsService,
  ) {}

  ngOnInit(): void {
    this.syncAuthState();
    this.loadDashboardData();
  }

  public toggleSidebar(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  public closeSidebar(): void {
    this.drawerOpen = false;
  }

  public goPosts(): void {
    this.router.navigate(['/posts']);
  }

  public goCategories(): void {
    this.router.navigate(['/categories']);
  }

  public goReports(): void {
    this.router.navigate(['/reports']);
  }

  public get isModerator(): boolean {
    return this.userRole === 'PROFESOR' || this.userRole === 'ADMINISTRADOR';
  }

  private syncAuthState(): void {
    this.isLogin = this.authService.isAuthenticated();
    this.userRole = this.authService.getUserRole() ?? 'ESTUDIANTE';
    this.currentUserName = this.authService.getUserName();
  }

  private loadDashboardData(): void {
    this.totalPosts = this.postsService.getTotalPosts();
    this.totalPublishedPosts = this.postsService.getTotalPublishedPosts();
    this.totalCategories = this.categoriesService.getAllCategories(false).length;
    this.totalComments = this.postsService.getTotalComments();
    this.pendingReports = this.reportsService.getPendingReportsCount();

    this.postsByCategory = this.postsService.getPostsByCategory();
    this.topPosters = this.postsService.getTopPosters();
    this.trendingCategories = this.postsService.getTrendingCategories();
  }
}
