import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Sidebar } from '../../../partials/sidebar/sidebar';
import { Footer } from '../../../partials/footer/footer';
import { AuthService } from '../../../services/auth.service';
import {CategoriesService} from '../../../services/categorias-service';
import { CategoryErrors, CategoryForm } from '../../../shared/interfaces/categories.interface';
import { UserRole } from '../../../models/auth-user.model';


@Component({
  selector: 'app-categories-form',
  standalone: true,
  imports: [...SHARED_IMPORTS, Navbar, Sidebar, Footer],
  templateUrl: './form.html',
  styleUrls: ['./form.scss'],
})
export class CategoriesForm implements OnInit {
  public drawerOpen = false;
  public isLogin = false;
  public userRole: UserRole = 'ESTUDIANTE';

  public isEditMode = false;
  public categoryId: number | null = null;

  public form: CategoryForm;
  public errors: CategoryErrors = {};

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly categoriesService: CategoriesService,
  ) {
    this.form = this.categoriesService.esquemaCategoria();
  }

  ngOnInit(): void {
    this.isLogin = this.authService.isAuthenticated();
    this.userRole = this.authService.getUserRole() ?? 'ESTUDIANTE';

    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      return;
    }

    this.isEditMode = true;
    this.categoryId = Number(idParam);

    const found = this.categoriesService.getCategoryById(this.categoryId);
    if (!found) {
      this.router.navigate(['/categories']);
      return;
    }

    this.form = {
      id: found.id,
      nombre: found.nombre,
      descripcion: found.descripcion,
      estado: found.estado,
    };
  }

  public toggleSidebar(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  public closeSidebar(): void {
    this.drawerOpen = false;
  }

  public goBack(): void {
    this.router.navigate(['/categories']);
  }

  public save(): void {
    this.errors = {};

    if (this.isEditMode && this.categoryId) {
      const result = this.categoriesService.updateCategory(this.categoryId, this.form);
      if (!result.ok) {
        this.errors = result.errors;
        return;
      }
      this.router.navigate(['/categories']);
      return;
    }

    const result = this.categoriesService.createCategory(this.form);
    if (!result.ok) {
      this.errors = result.errors;
      return;
    }

    this.router.navigate(['/categories']);
  }
}
