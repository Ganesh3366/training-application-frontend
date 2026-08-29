import { A11yModule } from '@angular/cdk/a11y';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CourseModule, CourseModuleManagementRequest } from '../../../models/app.models';
import { CourseModuleManagementService } from '../../../services/course-module-management';

export interface ModuleFormDialogData {
  courseId: number;
  module: CourseModule | null;
}

function nonWhitespace(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() ? null : { whitespace: true };
}

@Component({
  selector: 'app-module-form',
  standalone: true,
  imports: [
    A11yModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './module-form.html',
  styleUrl: './module-form.css',
})
export class ModuleFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ModuleFormComponent>);
  private readonly data = inject<ModuleFormDialogData>(MAT_DIALOG_DATA);
  private readonly management = inject(CourseModuleManagementService);

  readonly isEditMode = this.data.module !== null;
  readonly submitting = signal(false);
  readonly submissionError = signal<string | null>(null);
  readonly form = this.formBuilder.nonNullable.group({
    title: [this.data.module?.title ?? '', [Validators.required, nonWhitespace]],
    description: [this.data.module?.description ?? ''],
  });

  submit(): void {
    if (this.submitting()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: CourseModuleManagementRequest = {
      title: value.title.trim(),
      description: value.description.trim() || null,
    };
    this.submitting.set(true);
    this.dialogRef.disableClose = true;
    this.submissionError.set(null);
    const operation = this.data.module
      ? this.management.updateModule(this.data.courseId, this.data.module.id, request)
      : this.management.createModule(this.data.courseId, request);
    operation.subscribe({
      next: (module) => this.dialogRef.close(module),
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
    if (error.status === 400) return 'Review the module details and try again.';
    if (error.status === 403) return 'You do not have permission to save this module.';
    if (error.status === 404) return 'The course or module no longer exists.';
    if (error.status === 0)
      return 'Unable to reach SkillForge. Check your connection and try again.';
    return 'Unable to save the module. Please try again.';
  }
}
