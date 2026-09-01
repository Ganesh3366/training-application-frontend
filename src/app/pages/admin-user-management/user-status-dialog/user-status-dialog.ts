import { A11yModule } from '@angular/cdk/a11y';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AppUser } from '../../../models/app.models';

export interface UserStatusDialogData {
  user: AppUser;
}

@Component({
  selector: 'app-user-status-dialog',
  standalone: true,
  imports: [A11yModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <section aria-labelledby="deactivate-user-title">
      <div class="icon" aria-hidden="true"><mat-icon>person_off</mat-icon></div>
      <h2 mat-dialog-title id="deactivate-user-title">Deactivate {{ data.user.name }}?</h2>
      <mat-dialog-content>
        <p>
          {{ data.user.email }} will remain in SkillForge with their history and course assignments,
          but login access will be disabled until the account is reactivated.
        </p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" cdkFocusInitial (click)="close(false)">Cancel</button>
        <button mat-flat-button class="deactivate" type="button" (click)="close(true)">
          Deactivate
        </button>
      </mat-dialog-actions>
    </section>
  `,
  styles: [
    `
      section {
        max-width: 500px;
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
        line-height: 1.55;
      }
      mat-dialog-actions {
        padding: 10px 24px 22px;
      }
      .deactivate {
        color: #fff !important;
        background: #a52626 !important;
      }
    `,
  ],
})
export class UserStatusDialog {
  readonly data = inject<UserStatusDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<UserStatusDialog>);

  close(confirmed: boolean): void {
    this.dialogRef.close(confirmed);
  }
}
