import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { Navbar } from '../../../partials/navbar/navbar';
import { Sidebar } from '../../../partials/sidebar/sidebar';
import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../models/auth-user.model';

import {
  AdminUser,
  AdminUserUpdate,
  UserAdminService,
} from '../../../services/user-admin.service';

interface UserRow extends AdminUser {
  selectedRole: UserRole | '';
  selectedActive: boolean;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatSidenavModule,
    Navbar,
    Sidebar,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class AdminUsers implements OnInit {
  public readonly auth = inject(AuthService);

  private readonly api = inject(UserAdminService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly roles: UserRole[] = [
    'LECTOR',
    'AUTOR',
    'EDITOR',
    'ADMINISTRADOR',
  ];

  public rows: UserRow[] = [];
  public drawerOpen = false;
  public loading = false;
  public savingId: number | null = null;
  public error = '';
  public success = '';

  public page = 1;
  public count = 0;
  public hasNext = false;
  public hasPrevious = false;

  public get busy(): boolean {
    return this.loading || this.savingId !== null;
  }

  public ngOnInit(): void {
    this.loadPage(1);
  }

  public loadPage(page: number): void {
    if (this.busy || !Number.isInteger(page) || page < 1) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    // Evita mostrar datos anteriores si la nueva consulta falla.
    this.rows = [];
    this.hasNext = false;
    this.hasPrevious = false;
    this.count = 0;

    this.api.list(page)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: (result) => {
          this.rows = result.results.map((user) => this.toRow(user));
          this.page = page;
          this.count = result.count;
          this.hasNext = result.next !== null;
          this.hasPrevious = result.previous !== null;
        },
        error: (error: unknown) => {
          this.handleError(error);
        },
      });
  }

  public isProtected(user: AdminUser): boolean {
    return (
      user.id === this.auth.getUserId() ||
      user.is_superuser
    );
  }

  public hasChanges(row: UserRow): boolean {
    const roleChanged =
      row.selectedRole !== '' &&
      (
        row.roles.length !== 1 ||
        row.roles[0] !== row.selectedRole
      );

    return roleChanged || row.selectedActive !== row.is_active;
  }

  public save(row: UserRow): void {
    if (
      this.busy ||
      !this.auth.isAdmin() ||
      this.isProtected(row) ||
      !this.hasChanges(row)
    ) {
      return;
    }

    const changes: AdminUserUpdate = {};

    if (
      row.selectedRole !== '' &&
      (
        row.roles.length !== 1 ||
        row.roles[0] !== row.selectedRole
      )
    ) {
      changes.role = row.selectedRole;
    }

    if (row.selectedActive !== row.is_active) {
      changes.is_active = row.selectedActive;
    }

    const description: string[] = [];

    if (changes.role !== undefined) {
      description.push(`Rol: ${changes.role}`);
    }

    if (changes.is_active !== undefined) {
      description.push(
        `Estado: ${changes.is_active ? 'Activa' : 'Inactiva'}`,
      );
    }

    const confirmed = window.confirm(
      `¿Guardar cambios para ${row.email}?\n\n` +
      description.join('\n') +
      '\n\nLa sesión anterior de esta cuenta quedará invalidada.',
    );

    if (!confirmed) {
      return;
    }

    this.error = '';
    this.success = '';
    this.savingId = row.id;

    this.api.update(row.id, changes)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.savingId = null;
        }),
      )
      .subscribe({
        next: (updated) => {
          this.rows = this.rows.map((item) =>
            item.id === updated.id ? this.toRow(updated) : item,
          );

          this.success =
            `Se actualizó ${updated.email}. ` +
            'Su sesión anterior quedó invalidada.';
        },
        error: (error: unknown) => {
          this.handleError(error);
        },
      });
  }

  private toRow(user: AdminUser): UserRow {
    return {
      ...user,
      selectedRole:
        user.roles.length === 1 ? user.roles[0] : '',
      selectedActive: user.is_active,
    };
  }

  private handleError(error: unknown): void {
    if (!(error instanceof HttpErrorResponse)) {
      this.error = 'Ocurrió un error inesperado.';
      return;
    }

    if (error.status === 401 || error.status === 403) {
      this.rows = [];
      this.count = 0;
      this.hasNext = false;
      this.hasPrevious = false;
    }

    if (error.status === 0) {
      this.error = 'No se pudo conectar con el servidor.';
      return;
    }

    if (error.status === 401) {
      this.error = 'Tu sesión venció. Inicia sesión nuevamente.';
      return;
    }

    if (error.status === 403) {
      this.error = 'No tienes permiso para realizar esta operación.';
      return;
    }

    if (error.status === 404) {
      this.error = 'No se encontró el usuario o la página solicitada.';
      return;
    }

    if (error.status === 400) {
      this.error =
        this.extractMessages(error.error).join(' ') ||
        'Revisa los cambios enviados.';
      return;
    }

    this.error = 'No se pudo completar la operación. Intenta nuevamente.';
  }

  private extractMessages(value: unknown): string[] {
    if (typeof value === 'string') {
      return [value];
    }

    if (Array.isArray(value)) {
      return value.flatMap((item) => this.extractMessages(item));
    }

    if (value !== null && typeof value === 'object') {
      return Object.values(value)
        .flatMap((item) => this.extractMessages(item));
    }

    return [];
  }
}