import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SHARED_IMPORTS } from '../../shared/shared_imports';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/auth-user.model';

type NavbarMode = 'public' | 'private';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    RouterModule
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class Navbar {
  @Input() mode: NavbarMode = 'public';
  @Input() userRole: UserRole = 'ESTUDIANTE';
  @Input() isLogin: boolean = false;

  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  public onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  public goToInicio(): void {
    if (this.mode === 'private') {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.router.navigate(['/landing']);
  }

  public goToRegistro(): void {
    this.router.navigate(['/registro']);
  }

  public goToLogin(): void {
    this.router.navigate(['/login']);
  }

  public goToProposito(): void {
    this.router.navigate(['/landing'], { fragment: 'proposito' });
  }

  public goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  public get isPublic(): boolean {
    return this.mode === 'public';
  }

  public get isPrivate(): boolean {
    return this.mode === 'private';
  }
}
