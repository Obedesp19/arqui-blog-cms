import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Footer } from '../../../partials/footer/footer';
import { ReportesService, ReporteForm } from '../../../services/reportes-service';
import { Sidebar } from "../../../partials/sidebar/sidebar";

type UserRole = 'ESTUDIANTE' | 'PROFESOR' | 'ADMINISTRADOR';
type ReportTargetType = 'POST' | 'COMENTARIO';

@Component({
  selector: 'app-reports-create',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    Navbar,
    Sidebar,
    Footer,
    Sidebar
],
  templateUrl: './create.html',
  styleUrls: ['./create.scss'],
})
export class ReportsCreate implements OnInit {
  public drawerOpen = false;
  public userRole: UserRole = 'ESTUDIANTE';

  public tipo: ReportTargetType = 'POST';
  public referenciaId: number = 0;
  public postId: number = 0;
  public motivo: string = '';
  public descripcion: string = '';

  public errors: any = {};

  public motivosPost: string[] = [
    'Contenido inapropiado',
    'Información falsa',
    'Spam',
    'Lenguaje ofensivo',
    'Otro',
  ];

  public motivosComentario: string[] = [
    'Comentario ofensivo',
    'Spam',
    'Acoso',
    'Información falsa',
    'Otro',
  ];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly reportesService: ReportesService,
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

    this.cargarEsquemaReporte();
    this.cargarDatosDesdeQueryParams();
  }

  /* =========================
     UI
     ========================= */
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
    if (this.postId > 0) {
      this.router.navigate(['/posts', this.postId]);
      return;
    }

    this.router.navigate(['/posts']);
  }

  /* =========================
     Acciones
     ========================= */
  public submit(): void {
    const reporte = this.obtenerReporteDesdeFormulario();

    this.errors = this.reportesService.validarReporte(reporte);

    if (Object.keys(this.errors).length > 0) {
      return;
    }

    const payload = {
      tipo: reporte.tipo,
      referenciaId: reporte.referenciaId,
      postId: reporte.postId,
      motivo: reporte.motivo.trim(),
      descripcion: reporte.descripcion.trim(),
      estado: reporte.estado,
    };

    console.log('Reporte a enviar al backend después:', payload);

    localStorage.setItem('lastReportDraft', JSON.stringify(payload));
    this.router.navigate(['/reports']);
  }

  /* =========================
     Helpers
     ========================= */
  private cargarEsquemaReporte(): void {
    const esquema = this.reportesService.esquemaReporte();

    this.tipo = esquema.tipo;
    this.referenciaId = esquema.referenciaId;
    this.postId = esquema.postId;
    this.motivo = esquema.motivo;
    this.descripcion = esquema.descripcion;
  }

  private cargarDatosDesdeQueryParams(): void {
    const typeParam = this.route.snapshot.queryParamMap.get('type');
    const referenciaIdParam = this.route.snapshot.queryParamMap.get('referenciaId');
    const postIdParam = this.route.snapshot.queryParamMap.get('postId');

    if (typeParam === 'comment') {
      this.tipo = 'COMENTARIO';
    } else {
      this.tipo = 'POST';
    }

    this.referenciaId = Number(referenciaIdParam ?? 0);
    this.postId = Number(postIdParam ?? 0);
  }

  private obtenerReporteDesdeFormulario(): ReporteForm {
    return {
      tipo: this.tipo,
      referenciaId: this.referenciaId,
      postId: this.postId,
      motivo: this.motivo,
      descripcion: this.descripcion,
      estado: 'PENDIENTE',
    };
  }

  /* =========================
     Getters
     ========================= */
  public get motivosDisponibles(): string[] {
    return this.tipo === 'POST' ? this.motivosPost : this.motivosComentario;
  }
}
