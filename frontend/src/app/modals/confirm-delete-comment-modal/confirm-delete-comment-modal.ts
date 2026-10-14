import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeleteCommentModalData {
  contenido: string;
  autor: string;
}

@Component({
  selector: 'app-confirm-delete-comment-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './confirm-delete-comment-modal.html',
  styleUrls: ['./confirm-delete-comment-modal.scss'],
})
export class ConfirmDeleteCommentModal {
  constructor(
    private readonly dialogRef: MatDialogRef<ConfirmDeleteCommentModal, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteCommentModalData,
  ) {}

  public cancel(): void {
    this.dialogRef.close(false);
  }

  public confirm(): void {
    this.dialogRef.close(true);
  }
}
