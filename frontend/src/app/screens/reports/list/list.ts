import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SHARED_IMPORTS } from '../../../shared/shared_imports';
import { Navbar } from '../../../partials/navbar/navbar';
import { Sidebar } from '../../../partials/sidebar/sidebar';
import { Footer } from '../../../partials/footer/footer';
import { AuthService } from '../../../services/auth.service';
import {
  ReportsService,
  ReportItem,
} from '../../../services/reports-service';
import { UserRole } from '../../../models/auth-user.model';
import { ModerationActionModal } from '../../../modals/moderation-action-modal/moderation-action-modal';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    Navbar,
    Sidebar,
    Footer,
  ],
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
})
export class ReportsList implements OnInit {
  public drawerOpen: boolean = false;
  public isLogin: boolean = false;
  public userRole: UserRole = 'ESTUDIANTE';
  public reports: ReportItem[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly reportsService: ReportsService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.isLogin = this.authService.isAuthenticated();
    this.userRole = this.authService.getUserRole() ?? 'ESTUDIANTE';
    this.loadReports();
  }

  public toggleSidebar(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  public closeSidebar(): void {
    this.drawerOpen = false;
  }

  public resolverReporte(report: ReportItem): void {
    const ref = this.dialog.open(ModerationActionModal, {
      width: '560px',
      data: {
        targetType: report.tipo,
        contenidoResumen: this.getContenidoResumen(report),
        autorContenido: this.getAutorContenido(report),
        motivo: report.motivo,
      },
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.reportsService.updateStatus(report.id, result.decision);
      this.loadReports();
    });
  }

  private loadReports(): void {
    this.reports = this.reportsService.getAllReports();
  }

  private getContenidoResumen(report: ReportItem): string {
    if (report.descripcion?.trim()) {
      return report.descripcion;
    }

    return `Reporte sobre ${report.tipo === 'POST' ? 'publicación' : 'comentario'} #${report.referenciaId}`;
  }

  private getAutorContenido(report: ReportItem): string {
    return report.reportadoPor || 'Usuario';
  }
}
