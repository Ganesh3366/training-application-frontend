import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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

  readonly activeMode = signal<AuthDialogMode>(this.data.mode);
  readonly submissionMessage = signal<string | null>(null);

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
  }

  submit(): void {
    const form = this.activeMode() === 'login' ? this.loginForm : this.signupForm;
    form.markAllAsTouched();

    if (form.invalid) {
      return;
    }

    this.submissionMessage.set(
      'Authentication is not connected yet. Your credentials have not been submitted or stored.',
    );
  }

  close(): void {
    this.dialogRef.close();
  }
}
