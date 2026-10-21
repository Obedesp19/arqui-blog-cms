import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
export interface DashboardCount { id: number | null; nombre: string; total: number; }
export interface DashboardData {
  published_posts: number;
  active_categories: number;
  approved_comments: number;
  posts_by_category: DashboardCount[];
  comments_by_category: DashboardCount[];
  top_authors: DashboardCount[];
  editorial: { pending_posts: number; pending_comments: number } | null;
}
@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  get() {
    return this.http.get<DashboardData>(`${environment.url_api.replace(/\/+$/, '')}/dashboard/`);
  }
}
