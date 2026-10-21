import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { SHARED_IMPORTS } from '../../shared/shared_imports';
import { Navbar } from '../../partials/navbar/navbar';
import { Sidebar } from '../../partials/sidebar/sidebar';
import { Footer } from '../../partials/footer/footer';
import { AuthService } from '../../services/auth.service';
import { DashboardApiService, DashboardData } from '../../services/dashboard-api.service';
@Component({
  selector: 'app-dashboard', standalone: true,
  imports: [...SHARED_IMPORTS, Navbar, Sidebar, Footer],
  templateUrl: './dashboard.html', styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(DashboardApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  drawerOpen = false;
  loading = false;
  error = '';
  data: DashboardData | null = null;
  get isLogin() { return this.auth.isAuthenticated(); }
  get userRole() { return this.auth.getUserRole() ?? 'LECTOR'; }
  get currentUserName() { return this.auth.getUserFirstName(); }
  get isModerator() { return this.auth.hasRole(['EDITOR', 'ADMINISTRADOR']); }
  ngOnInit(): void { this.refresh(); }
  toggleSidebar(): void { this.drawerOpen = !this.drawerOpen; }
  closeSidebar(): void { this.drawerOpen = false; }
  goPosts(): void { this.router.navigate(['/posts']); }
  goCategories(): void { this.router.navigate(['/categories']); }
  goComments(): void { this.router.navigate(['/workspace/comments']); }
  goWorkspace(): void { this.router.navigate(['/workspace/posts']); }
  refresh(): void {
    if (this.loading) return;
    this.loading = true;
    this.error = '';
    this.data = null;
    this.api.get().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; }),
    ).subscribe({
      next: data => { this.data = data; },
      error: () => { this.error = 'No se pudo cargar la actividad. Revisa tu conexión y vuelve a intentar.'; },
    });
  }
}
