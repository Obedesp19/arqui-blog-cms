import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ReportPostModalData {
  titulo: string;
}

export interface ReportPostModalResult {
  motivo: string;
}

@Component({
  selector: 'app-report-post-modal',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './report-post-modal.html',
  styleUrls: ['./report-post-modal.scss'],
})
export class ReportPostModal {
  public motivo: string = '';
  public error: string = '';

  constructor(
    private readonly dialogRef: MatDialogRef<ReportPostModal, ReportPostModalResult | null>,
    @Inject(MAT_DIALOG_DATA) public data: ReportPostModalData,
  ) {}

  public cancel(): void {
    this.dialogRef.close(null);
  }

  public submit(): void {
    this.error = '';

    const motivo = this.motivo.trim();

    if (!motivo) {
      this.error = 'El motivo es obligatorio.';
      return;
    }

    if (motivo.length < 10) {
      this.error = 'El motivo debe tener al menos 10 caracteres.';
      return;
    }

    this.dialogRef.close({ motivo });
  }
}
