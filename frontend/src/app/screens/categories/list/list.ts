import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Sidebar } from '../../../partials/sidebar/sidebar';
import { Footer } from '../../../partials/footer/footer';
import { AuthService } from '../../../services/auth.service';
import {CategoriesService} from '../../../services/categorias-service';
import { CategoryItem } from '../../../shared/interfaces/categories.interface';
import { UserRole } from '../../../models/auth-user.model';


@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [...SHARED_IMPORTS, Navbar, Sidebar, Footer],
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
})
export class CategoriesList implements OnInit {
  public drawerOpen = false;
  public isLogin = false;
  public userRole: UserRole = 'ESTUDIANTE';

  public search = '';
  public estado = 'TODAS';
  public rows: CategoryItem[] = [];

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly categoriesService: CategoriesService,
  ) {}

  ngOnInit(): void {
    this.isLogin = this.authService.isAuthenticated();
    this.userRole = this.authService.getUserRole() ?? 'ESTUDIANTE';
    this.loadRows();
  }

  public toggleSidebar(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  public closeSidebar(): void {
    this.drawerOpen = false;
  }

  public goCreate(): void {
    this.router.navigate(['/categories/create']);
  }

  public goEdit(id: number): void {
    this.router.navigate(['/categories', id, 'edit']);
  }

  public inactivate(id: number): void {
    this.categoriesService.inactivateCategory(id);
    this.loadRows();
  }

  public get filteredRows(): CategoryItem[] {
    const q = this.search.trim().toLowerCase();

    return this.rows.filter(row => {
      const matchesSearch =
        !q ||
        row.nombre.toLowerCase().includes(q) ||
        row.descripcion.toLowerCase().includes(q);

      const matchesEstado =
        this.estado === 'TODAS' || row.estado === this.estado;

      return matchesSearch && matchesEstado;
    });
  }

  private loadRows(): void {
    this.rows = this.categoriesService.getAllCategories(true);
  }
}
