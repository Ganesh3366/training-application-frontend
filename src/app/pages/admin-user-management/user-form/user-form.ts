import { A11yModule } from '@angular/cdk/a11y';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdminUserCreateRequest, Role } from '../../../models/app.models';
import { AdminUserService } from '../../../services/admin-user';

const ADMIN_USER_ROLES: readonly Role[] = ['USER', 'INSTRUCTOR', 'ADMIN'];

function nonWhitespace(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { whitespace: true };
}

function validRole(control: AbstractControl): ValidationErrors | null {
  return ADMIN_USER_ROLES.includes(control.value as Role) ? null : { role: true };
}

@Component({
  selector: 'app-admin-user-form',
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
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class AdminUserFormComponent {
  private readonly adminUsers = inject(AdminUserService);
  private readonly dialogRef = inject(MatDialogRef<AdminUserFormComponent>);

  readonly roleOptions = ADMIN_USER_ROLES;
  readonly submitting = signal(false);
  readonly submissionError = signal<string | null>(null);
  readonly form = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, nonWhitespace, Validators.maxLength(100)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, nonWhitespace, Validators.maxLength(100)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        nonWhitespace,
        Validators.minLength(8),
        Validators.maxLength(72),
      ],
    }),
    role: new FormControl<Role | null>(null, [Validators.required, validRole]),
  });

  submit(): void {
    if (this.submitting()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    if (value.role === null) return;

    const request: AdminUserCreateRequest = {
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      email: value.email.trim(),
      password: value.password,
      role: value.role,
    };

    this.submitting.set(true);
    this.submissionError.set(null);
    this.dialogRef.disableClose = true;
    this.adminUsers.createUser(request).subscribe({
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
    if (error.status === 409) return 'An account with this email already exists.';
    if (error.status === 400)
      return 'Some user details are invalid. Review the form and try again.';
    if (error.status === 401 || error.status === 403)
      return 'You do not have permission to create users.';
    if (error.status === 0)
      return 'Unable to reach SkillForge. Check your connection and try again.';
    return 'Unable to create the user. Please try again.';
  }
}
