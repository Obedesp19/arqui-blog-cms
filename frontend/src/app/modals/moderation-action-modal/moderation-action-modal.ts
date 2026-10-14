import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type ModerationDecision = 'APROBADO' | 'RECHAZADO' | 'ARCHIVADO';

export interface ModerationActionModalData {
  targetType: 'POST' | 'COMMENT';
  contenidoResumen: string;
  autorContenido: string;
  motivo: string;
}

export interface ModerationActionModalResult {
  decision: ModerationDecision;
  note: string;
}

@Component({
  selector: 'app-moderation-action-modal',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './moderation-action-modal.html',
  styleUrls: ['./moderation-action-modal.scss'],
})
export class ModerationActionModal {
  public selectedDecision: ModerationDecision | '' = '';
  public note: string = '';
  public error: string = '';

  constructor(
    private readonly dialogRef: MatDialogRef<ModerationActionModal, ModerationActionModalResult | null>,
    @Inject(MAT_DIALOG_DATA) public data: ModerationActionModalData,
  ) {}

  public cancel(): void {
    this.dialogRef.close(null);
  }

  public choose(decision: ModerationDecision): void {
    this.selectedDecision = decision;
    this.error = '';
  }

  public submit(): void {
    if (!this.selectedDecision) {
      this.error = 'Debes seleccionar una acción de moderación.';
      return;
    }

    this.dialogRef.close({
      decision: this.selectedDecision,
      note: this.note.trim(),
    });
  }
}
