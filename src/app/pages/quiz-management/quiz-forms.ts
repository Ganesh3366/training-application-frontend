import { A11yModule } from '@angular/cdk/a11y';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  AnswerOptionManagementResponse,
  QuizManagementResponse,
  QuizQuestionManagementResponse,
} from '../../models/app.models';

const nonBlank = (control: AbstractControl) =>
  typeof control.value === 'string' && control.value.trim() ? null : { blank: true };
const integer = (control: AbstractControl) =>
  Number.isInteger(control.value) ? null : { integer: true };

const textFormImports = [
  A11yModule,
  ReactiveFormsModule,
  MatButtonModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
];

export interface QuizFormData {
  quiz: QuizManagementResponse | null;
}

@Component({
  selector: 'app-quiz-form',
  standalone: true,
  imports: textFormImports,
  template: `
    <h2 mat-dialog-title>{{ data.quiz ? 'Edit' : 'Create' }} Quiz</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
          <mat-error>Enter a quiz title.</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Passing score</mat-label>
          <input matInput type="number" formControlName="passingScore" />
          <span matTextSuffix>%</span>
          <mat-error>Enter a whole-number score from 0 to 100.</mat-error>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" cdkFocusInitial (click)="ref.close()">Cancel</button>
        <button mat-flat-button type="submit" [disabled]="form.invalid">Save</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      form {
        min-width: min(440px, 80vw);
      }
      mat-form-field {
        display: block;
      }
    `,
  ],
})
export class QuizFormComponent {
  readonly data = inject<QuizFormData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<QuizFormComponent>);
  readonly form = new FormGroup({
    title: new FormControl(this.data.quiz?.title ?? '', {
      nonNullable: true,
      validators: [Validators.required, nonBlank],
    }),
    passingScore: new FormControl(this.data.quiz?.passingScore ?? 0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0), Validators.max(100), integer],
    }),
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.ref.close({ ...this.form.getRawValue(), title: this.form.controls.title.value.trim() });
  }
}

export interface QuestionFormData {
  question: QuizQuestionManagementResponse | null;
}

@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: textFormImports,
  template: `
    <h2 mat-dialog-title>{{ data.question ? 'Edit' : 'Add' }} Question</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline">
          <mat-label>Question</mat-label>
          <textarea matInput rows="4" formControlName="questionText"></textarea>
          <mat-error>Enter a question.</mat-error>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" cdkFocusInitial (click)="ref.close()">Cancel</button>
        <button mat-flat-button type="submit" [disabled]="form.invalid">Save</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      form {
        min-width: min(500px, 80vw);
      }
      mat-form-field {
        display: block;
      }
    `,
  ],
})
export class QuestionFormComponent {
  readonly data = inject<QuestionFormData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<QuestionFormComponent>);
  readonly form = new FormGroup({
    questionText: new FormControl(this.data.question?.questionText ?? '', {
      nonNullable: true,
      validators: [Validators.required, nonBlank],
    }),
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.ref.close({ questionText: this.form.controls.questionText.value.trim() });
  }
}

export interface OptionFormData {
  option: AnswerOptionManagementResponse | null;
}

@Component({
  selector: 'app-option-form',
  standalone: true,
  imports: [...textFormImports, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title>{{ data.option ? 'Edit' : 'Add' }} Answer Option</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline">
          <mat-label>Answer option</mat-label>
          <textarea matInput rows="3" formControlName="optionText"></textarea>
          <mat-error>Enter an answer option.</mat-error>
        </mat-form-field>
        <mat-checkbox formControlName="correct" aria-label="Mark this answer option as correct">
          Correct answer
        </mat-checkbox>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" cdkFocusInitial (click)="ref.close()">Cancel</button>
        <button mat-flat-button type="submit" [disabled]="form.invalid">Save</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      form {
        min-width: min(500px, 80vw);
      }
      mat-form-field {
        display: block;
      }
    `,
  ],
})
export class OptionFormComponent {
  readonly data = inject<OptionFormData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<OptionFormComponent>);
  readonly form = new FormGroup({
    optionText: new FormControl(this.data.option?.optionText ?? '', {
      nonNullable: true,
      validators: [Validators.required, nonBlank],
    }),
    correct: new FormControl(this.data.option?.correct ?? false, { nonNullable: true }),
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.ref.close({
      ...this.form.getRawValue(),
      optionText: this.form.controls.optionText.value.trim(),
    });
  }
}

export interface QuizDeleteData {
  kind: 'quiz' | 'question' | 'answer option';
  name: string;
}

@Component({
  selector: 'app-quiz-delete',
  standalone: true,
  imports: [A11yModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Delete {{ data.kind }}?</h2>
    <mat-dialog-content>
      <p>Delete "{{ data.name }}"? This action cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" cdkFocusInitial (click)="ref.close(false)">Cancel</button>
      <button mat-flat-button type="button" (click)="ref.close(true)">Delete</button>
    </mat-dialog-actions>
  `,
})
export class QuizDeleteDialog {
  readonly data = inject<QuizDeleteData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<QuizDeleteDialog>);
}
