import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared_imports';
import { Navbar } from '../../partials/navbar/navbar';
import { Sidebar } from '../../partials/sidebar/sidebar';
import { Footer } from '../../partials/footer/footer';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/auth-user.model';

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface ProfileErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  general?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    Navbar,
    Sidebar,
    Footer,
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class Profile implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  saving = false;
  public drawerOpen: boolean = false;
  public isLogin: boolean = false;
  public userRole: UserRole = 'LECTOR';

  public form: ProfileForm = {
    firstName: '',
    lastName: '',
    email: '',
    role: 'LECTOR',
    avatar: 'assets/images/avatares/avatar-gorra-lentes.png',
  };

  public errors: ProfileErrors = {};
  public successMessage: string = '';

  public avatars: string[] = [
    'assets/images/avatares/avatar-original.png',
    'assets/images/avatares/avatar-lentes.png',
    'assets/images/avatares/avatar-gorra-lentes.png',
    'assets/images/avatares/avatar-mono.png',
    'assets/images/avatares/avatar-navidad.png',
    'assets/images/avatares/avatar-navidad-lentes.png',
  ];

  constructor(
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.isLogin = this.authService.isAuthenticated();
    this.userRole = this.authService.getUserRole() ?? 'LECTOR';

    this.form = {
      firstName: this.authService.getUserFirstName(),
      lastName: this.authService.getUserLastName(),
      email: this.authService.getUserEmail(),
      role: this.userRole,
      avatar: this.authService.getUserAvatar() || 'assets/images/avatares/avatar-gorra-lentes.png',
    };
  }

  public toggleSidebar(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  public closeSidebar(): void {
    this.drawerOpen = false;
  }

  public selectAvatar(avatar: string): void {
    if (this.saving) return;
    this.form.avatar = avatar;
    this.successMessage = '';
  }

  public onAvatarError(): void {
    this.form.avatar = 'assets/images/avatares/avatar-original.png';
  }

  public saveProfile(): void {
    if (this.saving) return;
    this.errors = {};
    this.successMessage = '';

    if (!this.form.firstName.trim()) {
      this.errors.firstName = 'El nombre es obligatorio.';
    }

    if (!this.form.lastName.trim()) {
      this.errors.lastName = 'Los apellidos son obligatorios.';
    }

    if (!this.form.email.trim()) {
      this.errors.email = 'El correo institucional es obligatorio.';
    } else if (!this.form.email.includes('@')) {
      this.errors.email = 'Ingresa un correo válido.';
    }

    if (Object.keys(this.errors).length > 0) {
      return;
    }

    this.saving = true;
    this.authService.updateProfile({
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      avatar: this.form.avatar,
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.saving = false; }),
    ).subscribe(result => {
      if (!result.ok) {
        this.errors.general = result.error;
        return;
      }
      this.form.firstName = this.authService.getUserFirstName();
      this.form.lastName = this.authService.getUserLastName();
      this.form.email = this.authService.getUserEmail();
      this.successMessage = 'Perfil actualizado. Para iniciar sesión, utiliza el correo que aparece aquí.';
    });
  }
}
