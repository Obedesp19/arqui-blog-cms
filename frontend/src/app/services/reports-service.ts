import { Injectable } from '@angular/core';

export type ReportTargetType = 'POST' | 'COMENTARIO';

export type ReportStatus =
  | 'PENDIENTE'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'ARCHIVADO';

export interface ReporteForm {
  tipo: ReportTargetType;
  referenciaId: number;
  postId: number;
  motivo: string;
  descripcion: string;
  estado: ReportStatus;
}

export interface ReporteErrors {
  tipo?: string;
  referenciaId?: string;
  postId?: string;
  motivo?: string;
  descripcion?: string;
  estado?: string;
}

export interface ReportItem extends ReporteForm {
  id: number;
  fecha: string;
  reportadoPor: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private reports: ReportItem[] = [];

  public esquemaReporte(): ReporteForm {
    return {
      tipo: 'POST',
      referenciaId: 0,
      postId: 0,
      motivo: '',
      descripcion: '',
      estado: 'PENDIENTE',
    };
  }

  public validarReporte(reporte: ReporteForm): ReporteErrors {
    const errors: ReporteErrors = {};

    if (reporte.tipo !== 'POST' && reporte.tipo !== 'COMENTARIO') {
      errors.tipo = 'Tipo de reporte inválido.';
    }

    if (!reporte.referenciaId || reporte.referenciaId <= 0) {
      errors.referenciaId = 'Referencia inválida.';
    }

    if (
      reporte.tipo === 'COMENTARIO' &&
      (!reporte.postId || reporte.postId <= 0)
    ) {
      errors.postId = 'El comentario debe pertenecer a una publicación.';
    }

    if (!reporte.motivo?.trim()) {
      errors.motivo = 'Debes seleccionar un motivo.';
    } else if (reporte.motivo.trim().length < 3) {
      errors.motivo = 'Motivo demasiado corto.';
    } else if (reporte.motivo.trim().length > 120) {
      errors.motivo = 'Motivo demasiado largo.';
    }

    if (reporte.descripcion?.trim().length > 500) {
      errors.descripcion = 'La descripción no puede exceder 500 caracteres.';
    }

    if (
      reporte.estado !== 'PENDIENTE' &&
      reporte.estado !== 'APROBADO' &&
      reporte.estado !== 'RECHAZADO' &&
      reporte.estado !== 'ARCHIVADO'
    ) {
      errors.estado = 'Estado inválido.';
    }

    return errors;
  }

  public createReport(
    reporte: ReporteForm,
    reportadoPor: string = 'Usuario'
  ): { ok: boolean; errors?: ReporteErrors; reportId?: number } {
    const errors = this.validarReporte(reporte);

    if (Object.keys(errors).length > 0) {
      return {
        ok: false,
        errors,
      };
    }

    const newId = this.generateId();

    const item: ReportItem = {
      id: newId,
      tipo: reporte.tipo,
      referenciaId: reporte.referenciaId,
      postId: reporte.postId,
      motivo: reporte.motivo.trim(),
      descripcion: reporte.descripcion.trim(),
      estado: reporte.estado,
      fecha: this.getCurrentDate(),
      reportadoPor: reportadoPor.trim() || 'Usuario',
    };

    this.reports.unshift(item);

    return {
      ok: true,
      reportId: newId,
    };
  }

  public getAllReports(): ReportItem[] {
    return [...this.reports];
  }

  public getReportById(id: number): ReportItem | null {
    const found = this.reports.find((item) => item.id === id);
    return found ? { ...found } : null;
  }

  public updateStatus(reportId: number, status: ReportStatus): boolean {
    const index = this.reports.findIndex((item) => item.id === reportId);

    if (index === -1) {
      return false;
    }

    this.reports[index] = {
      ...this.reports[index],
      estado: status,
    };

    return true;
  }

  public deleteReport(reportId: number): boolean {
    const before = this.reports.length;
    this.reports = this.reports.filter((item) => item.id !== reportId);
    return this.reports.length < before;
  }

  public getPendingReportsCount(): number {
    return this.reports.filter((report) => report.estado === 'PENDIENTE').length;
  }

  private generateId(): number {
    return this.reports.length > 0
      ? Math.max(...this.reports.map((item) => item.id)) + 1
      : 1;
  }

  private getCurrentDate(): string {
    return new Date().toLocaleDateString('es-MX');
  }
}
