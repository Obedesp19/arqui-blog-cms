import { Component, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared_imports';
import { Navbar } from '../../partials/navbar/navbar';
import { Sidebar } from '../../partials/sidebar/sidebar';
import { Footer } from '../../partials/footer/footer';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/auth-user.model';

interface ProfileForm {
  firstName: string;
  lastName: string;
  lastNameMother: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface ProfileErrors {
  firstName?: string;
  lastName?: string;
  lastNameMother?: string;
  email?: string;
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
  public drawerOpen: boolean = false;
  public isLogin: boolean = false;
  public userRole: UserRole = 'ESTUDIANTE';

  public form: ProfileForm = {
    firstName: '',
    lastName: '',
    lastNameMother: '',
    email: '',
    role: 'ESTUDIANTE',
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
    this.userRole = this.authService.getUserRole() ?? 'ESTUDIANTE';

    this.form = {
      firstName: this.authService.getUserFirstName(),
      lastName: this.authService.getUserLastName(),
      lastNameMother: this.authService.getUserLastNameMother(),
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
    this.form.avatar = avatar;
    this.successMessage = '';
  }

  public onAvatarError(): void {
    this.form.avatar = 'assets/images/avatares/avatar-original.png';
  }

  public saveProfile(): void {
    this.errors = {};
    this.successMessage = '';

    if (!this.form.firstName.trim()) {
      this.errors.firstName = 'El nombre es obligatorio.';
    }

    if (!this.form.lastName.trim()) {
      this.errors.lastName = 'El apellido paterno es obligatorio.';
    }

    if (!this.form.lastNameMother.trim()) {
      this.errors.lastNameMother = 'El apellido materno es obligatorio.';
    }

    if (!this.form.email.trim()) {
      this.errors.email = 'El correo institucional es obligatorio.';
    } else if (!this.form.email.includes('@')) {
      this.errors.email = 'Ingresa un correo válido.';
    }

    if (Object.keys(this.errors).length > 0) {
      return;
    }

    const result = this.authService.updateProfile({
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      lastNameMother: this.form.lastNameMother.trim(),
      email: this.form.email.trim(),
      avatar: this.form.avatar,
    });

    if (!result.ok) {
      this.errors.email = result.error;
      return;
    }

    this.successMessage = 'Perfil actualizado correctamente.';
  }
}
