import { Component } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  public username: string = '';
  public password: string = '';

  public focusedField: '' | 'email' | 'password' = '';
  public isLoading: boolean = false;

  public hide_1: boolean = true;
  public inputType_1: 'password' | 'text' = 'password';

  public errors = {
    username: '',
    password: '',
    credentials: '',
  };

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
  ) {}

  public setFocus(field: '' | 'email' | 'password'): void {
    this.focusedField = field;
  }

  public showPassword(): void {
    this.hide_1 = !this.hide_1;
    this.inputType_1 = this.hide_1 ? 'password' : 'text';
  }

  public login(): void {
    this.clearErrors();

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.authService.authenticate(this.username, this.password).subscribe((authResult) => {
      this.isLoading = false;

      if (!authResult.ok) {
        this.errors.credentials = authResult.error;
        return;
      }

      const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
      this.router.navigateByUrl(redirectTo || '/dashboard');
    });
  }

  public goRegistro(): void {
    this.router.navigate(['/registro']);
  }

  public recuperarPwd(): void {
    alert('La recuperación de contraseña aún no está disponible.');
  }

  private validateForm(): boolean {
    let isValid = true;

    const email = this.username.trim();
    const password = this.password.trim();

    if (!email) {
      this.errors.username = 'El correo es obligatorio.';
      isValid = false;
    } else if (!this.isValidEmail(email)) {
      this.errors.username = 'Ingresa un correo válido.';
      isValid = false;
    }

    if (!password) {
      this.errors.password = 'La contraseña es obligatoria.';
      isValid = false;
    } else if (password.length < 8) {
      this.errors.password = 'La contraseña debe tener al menos 8 caracteres.';
      isValid = false;
    }

    return isValid;
  }

  private clearErrors(): void {
    this.errors = {
      username: '',
      password: '',
      credentials: '',
    };
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
