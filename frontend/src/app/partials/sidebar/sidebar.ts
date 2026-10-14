import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../shared/shared_imports';
import { UserRole } from '../../models/auth-user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  @Input() userRole: UserRole = 'ESTUDIANTE';
  @Input() isLogin: boolean = false;

  @Output() closeSidebar = new EventEmitter<void>();

  constructor(
    private readonly router: Router
  ) {}

  public goTo(route: string): void {
    this.router.navigate([route]);
    this.closeSidebar.emit();
  }

  public get canSeeCategories(): boolean {
    return this.userRole === 'PROFESOR' || this.userRole === 'ADMINISTRADOR';
  }

  public get canSeeReports(): boolean {
    return this.userRole === 'PROFESOR' || this.userRole === 'ADMINISTRADOR';
  }

  public get canSeeDashboard(): boolean {
    return true;
  }
}
