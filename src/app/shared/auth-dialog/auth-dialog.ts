import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth';

export type AuthDialogMode = 'login' | 'signup';

export interface AuthDialogData {
  mode: AuthDialogMode;
}

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './auth-dialog.html',
  styleUrl: './auth-dialog.css',
})
export class AuthDialog {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AuthDialog>);
  private readonly data = inject<AuthDialogData>(MAT_DIALOG_DATA);
  private readonly auth = inject(AuthService);

  readonly activeMode = signal<AuthDialogMode>(this.data.mode);
  readonly submissionMessage = signal<string | null>(null);
  readonly submissionIsError = signal(false);
  readonly submitting = signal(false);

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly signupForm = this.formBuilder.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  switchMode(mode: AuthDialogMode): void {
    this.activeMode.set(mode);
    this.submissionMessage.set(null);
    this.submissionIsError.set(false);
  }

  submit(): void {
    if (this.submitting()) return;
    const form = this.activeMode() === 'login' ? this.loginForm : this.signupForm;
    form.markAllAsTouched();

    if (form.invalid) {
      return;
    }

    this.submissionMessage.set(null);
    this.submissionIsError.set(false);
    this.submitting.set(true);

    if (this.activeMode() === 'login') {
      this.auth.login(this.loginForm.getRawValue()).subscribe({
        next: () => this.dialogRef.close(),
        error: () => {
          this.submissionMessage.set('Unable to log in. Check your email and password and try again.');
          this.submissionIsError.set(true);
          this.submitting.set(false);
        },
      });
      return;
    }

    const signup = this.signupForm.getRawValue();
    this.auth.signup({
      name: `${signup.firstName.trim()} ${signup.lastName.trim()}`.trim(),
      email: signup.email,
      password: signup.password,
    }).subscribe({
      next: () => {
        this.loginForm.controls.email.setValue(signup.email);
        this.signupForm.controls.password.reset();
        this.activeMode.set('login');
        this.submissionMessage.set('Account created. You can now log in.');
        this.submitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.submissionMessage.set(
          error.status === 409
            ? 'An account with this email already exists.'
            : 'Unable to create your account. Check your details and try again.',
        );
        this.submissionIsError.set(true);
        this.submitting.set(false);
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
