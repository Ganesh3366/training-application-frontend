import { HttpErrorResponse } from '@angular/common/http';
import { A11yModule } from '@angular/cdk/a11y';
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
import { MatSelectModule } from '@angular/material/select';
import {
  CourseManagementCategory,
  CourseManagementLevel,
  CourseManagementRequest,
  CourseManagementResponse,
} from '../../../models/app.models';
import { CourseManagementService } from '../../../services/course-management';
import { COURSE_CATEGORY_OPTIONS, COURSE_LEVEL_OPTIONS } from '../course-management-options';

export interface CourseFormDialogData {
  course: CourseManagementResponse | null;
}

function nonWhitespace(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim().length > 0 ? null : { whitespace: true };
}

function positiveInteger(control: AbstractControl<number>): ValidationErrors | null {
  const value = control.value;
  return typeof value === 'number' &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= 1
    ? null
    : { positiveInteger: true };
}

@Component({
  selector: 'app-course-form',
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
  templateUrl: './course-form.html',
  styleUrl: './course-form.css',
})
export class CourseFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CourseFormComponent>);
  private readonly data = inject<CourseFormDialogData>(MAT_DIALOG_DATA);
  private readonly courseManagement = inject(CourseManagementService);

  readonly isEditMode = this.data.course !== null;
  readonly submitting = signal(false);
  readonly submissionError = signal<string | null>(null);

  readonly levelOptions = COURSE_LEVEL_OPTIONS;
  readonly categoryOptions = COURSE_CATEGORY_OPTIONS;

  readonly form = this.formBuilder.nonNullable.group({
    title: [this.data.course?.title ?? '', [Validators.required, nonWhitespace]],
    description: [this.data.course?.description ?? '', [Validators.required, nonWhitespace]],
    instructor: [this.data.course?.instructor ?? '', [Validators.required, nonWhitespace]],
    duration: [this.data.course?.duration ?? 1, [Validators.required, positiveInteger]],
    level: [this.data.course?.level ?? ('BEGINNER' as CourseManagementLevel), Validators.required],
    category: [
      this.data.course?.category ?? ('INFORMATION_TECHNOLOGY' as CourseManagementCategory),
      Validators.required,
    ],
  });

  submit(): void {
    if (this.submitting()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.dialogRef.disableClose = true;
    this.submissionError.set(null);
    const value = this.form.getRawValue();
    const request: CourseManagementRequest = {
      ...value,
      title: value.title.trim(),
      description: value.description.trim(),
      instructor: value.instructor.trim(),
    };
    const operation = this.data.course
      ? this.courseManagement.updateCourse(this.data.course.id, request)
      : this.courseManagement.createCourse(request);

    operation.subscribe({
      next: (course) => this.dialogRef.close(course),
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
    if (error.status === 400)
      return 'Some course details are invalid. Review the form and try again.';
    if (error.status === 403) return 'You do not have permission to save this course.';
    if (error.status === 404)
      return 'This course no longer exists. Close the form and refresh the list.';
    return 'Unable to save the course. Please try again.';
  }
}
