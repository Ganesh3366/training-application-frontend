import { A11yModule } from '@angular/cdk/a11y';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeleteDialogData {
  kind: 'module' | 'content';
  name: string;
}

@Component({
  selector: 'app-confirm-management-delete-dialog',
  standalone: true,
  imports: [A11yModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <section [attr.aria-labelledby]="'delete-' + data.kind + '-title'">
      <div class="icon" aria-hidden="true"><mat-icon>delete_outline</mat-icon></div>
      <h2 mat-dialog-title [id]="'delete-' + data.kind + '-title'">
        Delete {{ data.kind }} “{{ data.name }}”?
      </h2>
      <mat-dialog-content><p>This action cannot be undone.</p></mat-dialog-content>
      <mat-dialog-actions align="end"
        ><button mat-button type="button" cdkFocusInitial (click)="close(false)">Cancel</button
        ><button mat-flat-button class="delete" type="button" (click)="close(true)">
          Delete {{ data.kind }}
        </button></mat-dialog-actions
      >
    </section>
  `,
  styles: [
    `
      section {
        max-width: 470px;
        padding-top: 22px;
      }
      .icon {
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        margin: 0 24px 4px;
        border-radius: 50%;
        color: #9b1c1c;
        background: #fff0f0;
      }
      h2 {
        color: #301313;
      }
      p {
        margin: 0;
        color: #536073;
      }
      mat-dialog-actions {
        padding: 10px 24px 22px;
      }
      .delete {
        color: #fff !important;
        background: #a52626 !important;
      }
    `,
  ],
})
export class ConfirmManagementDeleteDialog {
  readonly data = inject<ConfirmDeleteDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmManagementDeleteDialog>);
  close(confirmed: boolean): void {
    this.dialogRef.close(confirmed);
  }
}
