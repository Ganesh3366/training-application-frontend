import { A11yModule } from '@angular/cdk/a11y';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  ModuleContent,
  ModuleContentManagementRequest,
  ModuleContentType,
} from '../../../models/app.models';
import { CourseModuleManagementService } from '../../../services/course-module-management';

export interface ContentFormDialogData {
  courseId: number;
  moduleId: number;
  content: ModuleContent | null;
}

function nonWhitespace(control: AbstractControl<string | null>): ValidationErrors | null {
  return control.value?.trim() ? null : { whitespace: true };
}

@Component({
  selector: 'app-content-form',
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
  templateUrl: './content-form.html',
  styleUrl: './content-form.css',
})
export class ContentFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ContentFormComponent>);
  private readonly data = inject<ContentFormDialogData>(MAT_DIALOG_DATA);
  private readonly management = inject(CourseModuleManagementService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isEditMode = this.data.content !== null;
  readonly submitting = signal(false);
  readonly submissionError = signal<string | null>(null);
  readonly form = this.formBuilder.group({
    type: this.formBuilder.nonNullable.control<ModuleContentType>(
      this.data.content?.type ?? 'TEXT',
      Validators.required,
    ),
    title: this.formBuilder.nonNullable.control(this.data.content?.title ?? '', [
      Validators.required,
      nonWhitespace,
    ]),
    textContent: this.formBuilder.control<string | null>(this.data.content?.textContent ?? null),
    videoUrl: this.formBuilder.control<string | null>(this.data.content?.videoUrl ?? null),
  });

  constructor() {
    this.applyTypeRules(this.form.controls.type.value, false);
    this.form.controls.type.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type) => this.applyTypeRules(type, true));
  }

  submit(): void {
    if (this.submitting()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request: ModuleContentManagementRequest = {
      type: value.type,
      title: value.title.trim(),
      textContent: value.type === 'TEXT' ? value.textContent!.trim() : null,
      videoUrl: value.type === 'VIDEO' ? value.videoUrl!.trim() : null,
    };
    this.submitting.set(true);
    this.dialogRef.disableClose = true;
    this.submissionError.set(null);
    const operation = this.data.content
      ? this.management.updateContent(
          this.data.courseId,
          this.data.moduleId,
          this.data.content.id,
          request,
        )
      : this.management.createContent(this.data.courseId, this.data.moduleId, request);
    operation.subscribe({
      next: (content) => this.dialogRef.close(content),
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

  private applyTypeRules(type: ModuleContentType, clearOpposite: boolean): void {
    const text = this.form.controls.textContent;
    const video = this.form.controls.videoUrl;
    if (type === 'TEXT') {
      text.setValidators([Validators.required, nonWhitespace]);
      video.clearValidators();
      if (clearOpposite) video.setValue(null, { emitEvent: false });
    } else {
      video.setValidators([Validators.required, nonWhitespace]);
      text.clearValidators();
      if (clearOpposite) text.setValue(null, { emitEvent: false });
    }
    text.updateValueAndValidity({ emitEvent: false });
    video.updateValueAndValidity({ emitEvent: false });
  }

  private errorMessage(error: HttpErrorResponse): string {
    if (error.status === 400) return 'Review the content details and try again.';
    if (error.status === 403) return 'You do not have permission to save this content.';
    if (error.status === 404) return 'The course, module or content no longer exists.';
    if (error.status === 0)
      return 'Unable to reach SkillForge. Check your connection and try again.';
    return 'Unable to save the content. Please try again.';
  }
}
