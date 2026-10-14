import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeletePostModalData {
  titulo: string;
}

@Component({
  selector: 'app-confirm-delete-post-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './confirm-delete-post-modal.html',
  styleUrls: ['./confirm-delete-post-modal.scss'],
})
export class ConfirmDeletePostModal {
  constructor(
    private readonly dialogRef: MatDialogRef<ConfirmDeletePostModal, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeletePostModalData,
  ) {}

  public cancel(): void {
    this.dialogRef.close(false);
  }

  public confirm(): void {
    this.dialogRef.close(true);
  }
}
