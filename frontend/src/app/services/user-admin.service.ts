import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { UserRole } from '../models/auth-user.model';

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles: UserRole[];
  is_active: boolean;
  is_superuser: boolean;
}

export interface AdminUserPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

export interface AdminUserUpdate {
  role?: UserRole;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserAdminService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    `${environment.url_api.replace(/\/+$/, '')}/admin/users/`;

  public list(page: number): Observable<AdminUserPage> {
    return this.http.get<AdminUserPage>(this.baseUrl, {
      params: { page },
    });
  }

  public update(
    id: number,
    input: AdminUserUpdate,
  ): Observable<AdminUser> {
    const body: AdminUserUpdate = {};

    if (input.role !== undefined) {
      body.role = input.role;
    }

    if (input.is_active !== undefined) {
      body.is_active = input.is_active;
    }

    return this.http.patch<AdminUser>(
      `${this.baseUrl}${id}/`,
      body,
    );
  }
}