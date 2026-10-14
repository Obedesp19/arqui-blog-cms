
import { Injectable } from '@angular/core';
import { ValidatorService } from './tools/validator-service';

export type ReportTargetType = 'POST' | 'COMENTARIO';

export interface ReporteForm {
  tipo: ReportTargetType;
  referenciaId: number;
  postId: number;
  motivo: string;
  descripcion: string;
  estado: string;
}

export type ReporteErrors = Partial<Record<keyof ReporteForm, string>>;

@Injectable({
  providedIn: 'root',
})
export class ReportesService {

  constructor(
    private readonly validatorService: ValidatorService
  ) {}

  /* =========================================================
     1) ESQUEMA
     ========================================================= */
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

  /* =========================================================
     2) VALIDACIÓN
     ========================================================= */
  public validarReporte(reporte: ReporteForm): ReporteErrors {
    const errors: ReporteErrors = {};

    const motivo = reporte.motivo?.trim() ?? '';
    const descripcion = reporte.descripcion?.trim() ?? '';

    if (!reporte.tipo?.trim()) {
      errors.tipo = 'Debes seleccionar el tipo de reporte.';
    }

    if (!reporte.referenciaId || reporte.referenciaId <= 0) {
      errors.referenciaId = 'No se encontró la referencia del contenido reportado.';
    }

    if (!motivo) {
      errors.motivo = 'Debes seleccionar un motivo.';
    }

    if (!descripcion) {
      errors.descripcion = 'La descripción es obligatoria.';
    } else if (!this.validatorService.minLen(descripcion, 10)) {
      errors.descripcion = 'La descripción debe tener al menos 10 caracteres.';
    } else if (!this.validatorService.maxLen(descripcion, 500)) {
      errors.descripcion = 'La descripción no puede exceder los 500 caracteres.';
    }

    return errors;
  }
}
