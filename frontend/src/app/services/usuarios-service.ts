import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ValidatorService } from './tools/validator-service';
import { ErrorsService } from './tools/errors-service';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegistroUser {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  telefono: string;
  ciudad: string;
  edad: number | null;
  id_usuario: string;
  confirmar_password: string;
  curp: string;
  rfc: string;
  grado_estudios: string;
  direccion: string;
  estado: string;
  terminos_condiciones: boolean;
  rol: string;
  last_name_mother: string;
}

export interface PerfilUsuarioUI {
  first_name: string;
  last_name: string;
  email: string;
  telefono: string;
  estado: string;
  ciudad: string;
  edad: number | null;
  

  // extras para UI
  codigo?: string;
  fecha_registro?: string; // ISO
  photoUrl?: string;
  rolEtiqueta?: string; // ej. "DOCENTE BUAP"
}

export type RegistroErrors = Partial<Record<keyof RegistroUser, string>>;

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {

  constructor(
    private readonly http: HttpClient,
    private validadorService: ValidatorService,
    private errorsService: ErrorsService
  ) {}

  /* =========================================================
     1) ESQUEMA (modelo base)
     ========================================================= */
  public esquemaUser(): RegistroUser {
    return {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      telefono: '',
      ciudad: '',
      edad: null,
      id_usuario: '',
      confirmar_password: '',
      curp: '', 
      rfc: '',
      grado_estudios: '',
      direccion: '', 
      estado: '',
      terminos_condiciones: false,
      last_name_mother: '', 
      rol: '',
    };
  }

  /* =========================================================
     2) VALIDACIÓN (centralizada)
     ========================================================= */

  public validarUsuario(user: RegistroUser): RegistroErrors {
    const errors: RegistroErrors = {};

    if (!user.first_name?.trim()) {
      errors.first_name = 'El nombre es obligatorio.';
    }

    if (!user.last_name?.trim()) {
      errors.last_name = 'Los apellidos son obligatorios.';
    }

    if (!user.email?.trim()) {
      errors.email = 'El correo electrónico es obligatorio.';
    } else if (!this.validadorService.email(user.email)) {
      errors.email = 'El correo electrónico no tiene un formato válido.';
    }

    if (!user.password?.trim()) {
      errors.password = 'La contraseña es obligatoria.';
    } else if (user.password.trim().length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (!user.telefono?.trim()) {
      errors.telefono = 'El teléfono es obligatorio.';
    } else if (!this.validadorService.phoneMX(user.telefono)) {
      errors.telefono = 'El teléfono debe contener 10 dígitos.';
    }

    if (!user.ciudad?.trim()) {
      errors.ciudad = 'La ciudad es obligatoria.';
    }

    if (user.edad === null || user.edad === undefined) {
      errors.edad = 'Seleccione una edad.';
    }
    // Función ID
   if (!user.id_usuario?.trim()) {
      errors.id_usuario = 'El ID de usuario es obligatorio.';
    } else if (user.id_usuario.length !== 8) {
      errors.id_usuario = 'El ID debe tener exactamente 8 caracteres.';
    }
     // Función contraseña 
    if (!user.confirmar_password?.trim()) {
      errors.confirmar_password = 'Es necesario confirmar la contraseña.';
    } else if (user.password !== user.confirmar_password) {
     errors.confirmar_password = 'Las contraseñas no coinciden.';
    }
    // CURP
    if (!user.curp?.trim()) {
      errors.curp = 'La CURP es obligatoria.';
    } else if (!user.curp.match(/^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/)) {
      errors.curp = 'El formato de la CURP es incorrecto.';
    }
     // RFC
    if (!user.rfc?.trim()) {
      errors.rfc = 'El RFC es obligatorio.';
    } else if (!user.rfc.match(/^([A-ZÑ&]{3,4}) ?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?([A-Z\d]{2})([A-Z\d])$/)) {
      errors.rfc = 'El formato del RFC es incorrecto.';
    }
     // Grado de estudios
    if (!user.grado_estudios) {
      errors.grado_estudios = 'Seleccione su grado de estudios.';
    }
    // Direccion
    if (!user.direccion?.trim()) {
      errors.direccion = 'La dirección es obligatoria.';
    }
     // Estados de la republica
    if (!user.estado) {
      errors.estado = 'Por favor, selecciona un estado de la república.';
    }

    if (!user.terminos_condiciones) {
      errors.terminos_condiciones = 'Debe aceptar los términos y condiciones.';
    }

   if (!user.last_name_mother?.trim()) {
      errors.last_name_mother = 'El apellido materno es obligatorio.';
    }

    if (!user.rol) {
      errors.rol = 'Seleccione un rol.';
    }
    return errors;

  }




  /* =========================================================
     3) HTTP: REGISTRO DE USUARIO
     - Registro va aquí (no en Facade)
     - Tipado: recibe RegistroUser
     - Devuelve Observable para usar subscribe()
     ========================================================= */

  public registrarUser(user: RegistroUser): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    console.log(user);
    return this.http
      .post<any>(`${environment.url_api}/users/`, user, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Ajuste fino según cómo responda su API
          const message =
            (typeof error.error === 'string' ? error.error : error.error?.message) ||
            error.message ||
            'No se pudo registrar el usuario.';

          return throwError(() => new Error(message));
        })
      );
  }

  /* =========================================================
     4) UI: PERFIL DUMMY (solo maquetación)
     ========================================================= */
  public getPerfilDummy(): PerfilUsuarioUI {
    return {
      first_name: 'Luis Yael',
      last_name: 'Méndez Sánchez',
      email: 'luis.mendezsanchez@correo.buap.mx',
      telefono: '2211908923',
      estado: 'Puebla',
      ciudad: 'Puebla',
      edad: 30,

      codigo: 'CARDUC-2026-LYMS-001',
      fecha_registro: '2026-02-09T12:00:00.000Z',
      photoUrl: 'assets/images/avatar.png',
      rolEtiqueta: 'DOCENTE BUAP',
    };
  }
}
