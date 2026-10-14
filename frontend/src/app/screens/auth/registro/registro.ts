import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatRadioModule,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  public user = {
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: '' as '' | 'estudiante' | 'profesor',
  };

  public errors = {
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: '',
    general: '',
  };

  public isLoading: boolean = false;
  public emailHint: boolean = false;
  public passwordMismatchHint: boolean = false;
  public hide_1: boolean = true;
  public inputType_1: 'password' | 'text' = 'password';
  public hide_2: boolean = true;
  public inputType_2: 'password' | 'text' = 'password';

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  public showPassword(): void {
    this.hide_1 = !this.hide_1;
    this.inputType_1 = this.hide_1 ? 'password' : 'text';
  }

  public showConfirmPassword(): void {
    this.hide_2 = !this.hide_2;
    this.inputType_2 = this.hide_2 ? 'password' : 'text';
  }

  public onEmailChange(): void {
    const email = this.user.email.trim();
    this.emailHint = email.length > 0 && !this.isValidEmail(email);
  }

  public onPasswordChange(): void {
    const password = this.user.password;
    const confirm = this.user.confirmPassword;
    this.passwordMismatchHint = confirm.length > 0 && password !== confirm;
  }

  /** Bloquea en keydown los caracteres no permitidos (números y especiales) */
  public onNombreKeydown(event: KeyboardEvent): void {
    // Permitir teclas de control
    if (
      event.ctrlKey || event.metaKey ||
      ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
       'Tab', 'Home', 'End', 'Enter'].includes(event.key)
    ) {
      return;
    }
    // Bloquear si no es letra (unicode) ni espacio
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜñÑ ]$/.test(event.key)) {
      event.preventDefault();
      return;
    }
    // Bloquear espacio al inicio
    const input = event.target as HTMLInputElement;
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }
        // Bloquear doble espacio
    if (event.key === ' ' && input.value[input.selectionStart! - 1] === ' ') {
      event.preventDefault();
    }
  }

  /** Filtra el texto pegado en nombre/apellidos */
  public onNombrePaste(event: ClipboardEvent, field: 'nombre' | 'apellidos'): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    let filtered = pasted.replace(/[^a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜñÑ ]/g, '');
    filtered = filtered.replace(/^ +/, '').replace(/ {2,}/g, ' ');
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const current = this.user[field];
    const next = (current.slice(0, start) + filtered + current.slice(end))
      .replace(/^ +/, '').replace(/ {2,}/g, ' ');
    this.user[field] = next;
  }


  public registrar(): void {
    this.clearErrors();

    if (!this.validateForm()) {
      return;
    }


    this.isLoading = true;
    this.authService
      .register({
        first_name: this.user.nombre.trim(),
        last_name: this.user.apellidos.trim(),
        email: this.user.email.trim(),
        password: this.user.password.trim(),
        role: this.user.rol,
      })
      .subscribe((result) => {
        this.isLoading = false;

        if (!result.ok) {
          this.errors.general = result.error;
          return;
        }

        this.router.navigate(['/login']);
      });
  }

  public goLogin(): void {
    this.router.navigate(['/login']);
  }

  private validateForm(): boolean {
    let isValid = true;

    const nombre = this.user.nombre.trim();
    const apellidos = this.user.apellidos.trim();
    const email = this.user.email.trim();
    const password = this.user.password.trim();
        const confirmPassword = this.user.confirmPassword.trim();
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜñÑ]([a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜñÑ]* [a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜñÑ]*|[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜñÑ]*)$/;

    if (!nombre) {
      this.errors.nombre = 'El nombre es obligatorio.';
      isValid = false;
          } else if (!soloLetras.test(nombre)) {
      this.errors.nombre = 'Solo se permiten letras y un espacio entre palabras.';
      isValid = false;
    }

    if (!apellidos) {
      this.errors.apellidos = 'Los apellidos son obligatorios.';
      isValid = false;
          } else if (!soloLetras.test(apellidos)) {
      this.errors.apellidos = 'Solo se permiten letras y un espacio entre palabras.';
      isValid = false;
    }

    if (!email) {
      this.errors.email = 'El correo institucional es obligatorio.';
      isValid = false;
    } else if (!this.isValidEmail(email)) {
      this.errors.email = 'Formato inválido. Ej: correo@dominio.com';
      isValid = false;
    }

    if (!password) {
      this.errors.password = 'La contraseña es obligatoria.';
      isValid = false;
    } else if (password.length < 8) {
      this.errors.password = 'La contraseña debe tener al menos 8 caracteres.';
      isValid = false;
    }

        if (!confirmPassword) {
      this.errors.confirmPassword = 'Confirma tu contraseña.';
      isValid = false;
    } else if (password !== confirmPassword) {
      this.errors.confirmPassword = 'Las contraseñas no coinciden.';
      isValid = false;
    }

    if (!this.user.rol) {
      this.errors.rol = 'Selecciona un rol.';
      isValid = false;
    }

    return isValid;
  }

  private clearErrors(): void {
    this.errors = {
      nombre: '',
      apellidos: '',
      email: '',
      password: '',
      confirmPassword: '',
      rol: '',
      general: '',
    };
  }

  private isValidEmail(email: string): boolean {
    // formato estricto: usuario@dominio.extension
    return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);
  }
}
