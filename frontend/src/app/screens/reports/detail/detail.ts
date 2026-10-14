import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Footer } from '../../../partials/footer/footer';
import { Sidebar } from '../../../partials/sidebar/sidebar';

type UserRole = 'ESTUDIANTE' | 'PROFESOR' | 'ADMINISTRADOR';
type ReportStatus = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
type ReportType = 'POST' | 'COMENTARIO';

interface ReportItem {
  id: number;
  tipo: ReportType;
  motivo: string;
  descripcion: string;
  usuario: string;
  contenidoReportado: string;
  fecha: string;
  estado: ReportStatus;
}

@Component({
  selector: 'app-reports-detail',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    Navbar,
    Sidebar,
    Footer,
  ],
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss'],
})
export class ReportsDetail implements OnInit {
  public drawerOpen = false;
  public userRole: UserRole = 'ADMINISTRADOR';

  public reportId: number = 0;
  public report: ReportItem | null = null;

  public reports: ReportItem[] = [
    {
      id: 1,
      tipo: 'POST',
      motivo: 'Contenido inapropiado',
      descripcion: 'La publicación contiene lenguaje ofensivo y no cumple las normas de convivencia.',
      usuario: 'Juan Pérez',
      contenidoReportado: 'Este es el contenido del post reportado por conducta inapropiada dentro del foro.',
      fecha: '25/03/2026',
      estado: 'PENDIENTE',
    },
    {
      id: 2,
      tipo: 'COMENTARIO',
      motivo: 'Spam',
      descripcion: 'El comentario se repitió múltiples veces en distintas publicaciones.',
      usuario: 'Ana López',
      contenidoReportado: 'Visiten este enlace ahora mismo para ganar premios...',
      fecha: '24/03/2026',
      estado: 'APROBADO',
    },
    {
      id: 3,
      tipo: 'POST',
      motivo: 'Información falsa',
      descripcion: 'El contenido compartido contiene información incorrecta académicamente.',
      usuario: 'Carlos Ruiz',
      contenidoReportado: 'Una explicación equivocada sobre normalización de bases de datos.',
      fecha: '23/03/2026',
      estado: 'RECHAZADO',
    },
  ];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const savedRole = localStorage.getItem('userRole') as UserRole | null;

    if (
      savedRole === 'ESTUDIANTE' ||
      savedRole === 'PROFESOR' ||
      savedRole === 'ADMINISTRADOR'
    ) {
      this.userRole = savedRole;
    }

    if (!this.canManageReports) {
      this.router.navigate(['/reports']);
      return;
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    this.reportId = Number(idParam ?? 0);

    const foundReport = this.reports.find((item) => item.id === this.reportId);

    if (!foundReport) {
      this.router.navigate(['/reports']);
      return;
    }

    this.report = foundReport;
  }

  public toggleSidebar(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  public closeSidebar(): void {
    this.drawerOpen = false;
  }

  public goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  public goBack(): void {
    this.router.navigate(['/reports']);
  }

  public get canManageReports(): boolean {
    return (
      this.userRole === 'PROFESOR' ||
      this.userRole === 'ADMINISTRADOR'
    );
  }
}
