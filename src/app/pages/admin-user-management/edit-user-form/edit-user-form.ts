import { A11yModule } from '@angular/cdk/a11y';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdminUserUpdateRequest, AppUser, Role } from '../../../models/app.models';
import { AdminUserService } from '../../../services/admin-user';
import { ADMIN_USER_ROLES, nonWhitespace, validRole } from '../user-form/user-form-validation';

export interface EditUserFormData {
  user: AppUser;
  editingCurrentAdmin: boolean;
}

@Component({
  selector: 'app-edit-user-form',
  standalone: true,
  imports: [
    A11yModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './edit-user-form.html',
  styleUrl: '../user-form/user-form.css',
})
export class EditUserFormComponent {
  private readonly adminUsers = inject(AdminUserService);
  private readonly dialogRef = inject(MatDialogRef<EditUserFormComponent>);
  readonly data = inject<EditUserFormData>(MAT_DIALOG_DATA);

  readonly roleOptions = ADMIN_USER_ROLES;
  readonly submitting = signal(false);
  readonly submissionError = signal<string | null>(null);
  readonly form = new FormGroup({
    name: new FormControl(this.data.user.name, {
      nonNullable: true,
      validators: [Validators.required, nonWhitespace, Validators.maxLength(100)],
    }),
    email: new FormControl(this.data.user.email, {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    role: new FormControl<Role>(this.data.user.role, {
      nonNullable: true,
      validators: [Validators.required, validRole],
    }),
  });

  constructor() {
    if (this.data.editingCurrentAdmin) this.form.controls.role.disable();
  }

  submit(): void {
    if (this.submitting()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    if (this.data.editingCurrentAdmin && value.role !== 'ADMIN') {
      this.submissionError.set('You cannot change your own ADMIN role.');
      return;
    }

    const request: AdminUserUpdateRequest = {
      name: value.name.trim(),
      email: value.email.trim(),
      role: value.role,
    };

    this.submitting.set(true);
    this.submissionError.set(null);
    this.dialogRef.disableClose = true;
    this.adminUsers.updateUser(this.data.user.id, request).subscribe({
      next: (user) => this.dialogRef.close(user),
      error: (error: HttpErrorResponse) => {
        this.submissionError.set(this.errorMessage(error));
        this.submitting.set(false);
        this.dialogRef.disableClose = false;
      },
    });
  }

  close(): void {
    if (!this.submitting()) this.dialogRef.close();
  }

  private errorMessage(error: HttpErrorResponse): string {
    if (error.status === 409) return 'A user with this email already exists.';
    if (
      error.status === 400 &&
      this.errorDetail(error) === 'You cannot change your own ADMIN role'
    ) {
      return 'You cannot change your own ADMIN role.';
    }
    if (error.status === 400)
      return 'Some user details are invalid. Review the form and try again.';
    if (error.status === 401 || error.status === 403)
      return 'You do not have permission to edit users.';
    if (error.status === 404)
      return 'This user no longer exists. Close the form and refresh the list.';
    if (error.status === 0)
      return 'Unable to reach SkillForge. Check your connection and try again.';
    return 'Unable to update the user. Please try again.';
  }

  private errorDetail(error: HttpErrorResponse): string | null {
    const body = error.error;
    if (!body || typeof body !== 'object' || !('detail' in body)) return null;
    return typeof body.detail === 'string' ? body.detail : null;
  }
}
