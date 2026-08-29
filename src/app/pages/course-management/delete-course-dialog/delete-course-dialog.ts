import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface DeleteCourseDialogData {
  title: string;
}

@Component({
  selector: 'app-delete-course-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <section aria-labelledby="delete-course-title">
      <div class="warning-icon" aria-hidden="true"><mat-icon>delete_outline</mat-icon></div>
      <h2 mat-dialog-title id="delete-course-title">Delete “{{ data.title }}”?</h2>
      <mat-dialog-content>
        <p>
          This action is only allowed when the course has no modules or protected learner and
          certificate data.
        </p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="close(false)" cdkFocusInitial>Cancel</button>
        <button mat-flat-button class="delete-action" type="button" (click)="close(true)">
          Delete course
        </button>
      </mat-dialog-actions>
    </section>
  `,
  styles: [
    `
      section {
        max-width: 470px;
        padding-top: 22px;
      }
      .warning-icon {
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
        line-height: 1.55;
      }
      mat-dialog-actions {
        padding: 10px 24px 22px;
      }
      .delete-action {
        color: #fff !important;
        background: #a52626 !important;
      }
    `,
  ],
})
export class DeleteCourseDialog {
  readonly data = inject<DeleteCourseDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DeleteCourseDialog>);

  close(confirmed: boolean): void {
    this.dialogRef.close(confirmed);
  }
}
