import { HttpErrorResponse } from '@angular/common/http';
import { ComponentType } from '@angular/cdk/portal';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  AnswerOptionManagementRequest,
  AnswerOptionManagementResponse,
  QuizManagementRequest,
  QuizManagementResponse,
  QuizQuestionManagementRequest,
  QuizQuestionManagementResponse,
} from '../../models/app.models';
import { QuizManagementService } from '../../services/quiz-management';
import {
  OptionFormComponent,
  OptionFormData,
  QuestionFormComponent,
  QuestionFormData,
  QuizDeleteData,
  QuizDeleteDialog,
  QuizFormComponent,
  QuizFormData,
} from './quiz-forms';

@Component({
  selector: 'app-quiz-management',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './quiz-management.html',
  styleUrl: './quiz-management.css',
})
export class QuizManagementComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(QuizManagementService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly courseId = Number(this.route.snapshot.paramMap.get('courseId'));
  readonly moduleId = Number(this.route.snapshot.paramMap.get('moduleId'));
  readonly invalidRoute = !this.validId(this.courseId) || !this.validId(this.moduleId);
  readonly quiz = signal<QuizManagementResponse | null>(null);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  constructor() {
    this.load();
  }
  load(): void {
    if (this.invalidRoute) {
      this.error.set('The quiz management link contains an invalid course or module ID.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.api.getQuiz(this.courseId, this.moduleId).subscribe({
      next: (quiz) => {
        this.quiz.set(this.normalized(quiz));
        this.loading.set(false);
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 404) this.quiz.set(null);
        else this.error.set(this.message(e));
        this.loading.set(false);
      },
    });
  }
  openQuizForm(): void {
    const editing = this.quiz() !== null;
    this.openForm<QuizFormComponent, QuizFormData, QuizManagementRequest>(
      QuizFormComponent,
      { quiz: this.quiz() },
      (body) => {
        const request = editing
          ? this.api.updateQuiz(this.courseId, this.moduleId, body)
          : this.api.createQuiz(this.courseId, this.moduleId, body);
        request.subscribe({
          next: (q) => {
            this.quiz.set(this.normalized(q));
            this.done(editing ? 'Quiz updated.' : 'Quiz created.');
          },
          error: (e) => this.failed(e, !editing),
        });
      },
    );
  }
  openQuestionForm(question: QuizQuestionManagementResponse | null): void {
    this.openForm<QuestionFormComponent, QuestionFormData, QuizQuestionManagementRequest>(
      QuestionFormComponent,
      { question },
      (body) => {
        const request = question
          ? this.api.updateQuestion(this.courseId, this.moduleId, question.id, body)
          : this.api.createQuestion(this.courseId, this.moduleId, body);
        request.subscribe({
          next: (saved) => {
            this.quiz.update((q) =>
              q
                ? {
                    ...q,
                    questions: this.sort(
                      question
                        ? q.questions.map((x) => (x.id === saved.id ? saved : x))
                        : [...q.questions, saved],
                    ),
                  }
                : q,
            );
            this.done(question ? 'Question updated.' : 'Question added.');
          },
          error: (e) => this.failed(e),
        });
      },
    );
  }
  openOptionForm(
    question: QuizQuestionManagementResponse,
    option: AnswerOptionManagementResponse | null,
  ): void {
    this.openForm<OptionFormComponent, OptionFormData, AnswerOptionManagementRequest>(
      OptionFormComponent,
      { option },
      (body) => {
        const request = option
          ? this.api.updateOption(this.courseId, this.moduleId, question.id, option.id, body)
          : this.api.createOption(this.courseId, this.moduleId, question.id, body);
        request.subscribe({
          next: (saved) => {
            this.updateQuestion(question.id, (q) => ({
              ...q,
              options: this.sort(
                (option
                  ? q.options.map((x) => (x.id === saved.id ? saved : x))
                  : [...q.options, saved]
                ).map((x) => (saved.correct && x.id !== saved.id ? { ...x, correct: false } : x)),
              ),
            }));
            this.done(option ? 'Answer option updated.' : 'Answer option added.');
          },
          error: (e) => this.failed(e),
        });
      },
    );
  }
  confirmDeleteQuiz(): void {
    const q = this.quiz();
    if (q)
      this.confirm({ kind: 'quiz', name: q.title }, () =>
        this.api.deleteQuiz(this.courseId, this.moduleId).subscribe({
          next: () => {
            this.quiz.set(null);
            this.done('Quiz deleted.');
          },
          error: (e) => this.failed(e),
        }),
      );
  }
  confirmDeleteQuestion(question: QuizQuestionManagementResponse): void {
    this.confirm({ kind: 'question', name: question.questionText }, () =>
      this.api.deleteQuestion(this.courseId, this.moduleId, question.id).subscribe({
        next: () => {
          this.quiz.update((q) =>
            q ? { ...q, questions: q.questions.filter((x) => x.id !== question.id) } : q,
          );
          this.done('Question deleted.');
        },
        error: (e) => this.failed(e),
      }),
    );
  }
  confirmDeleteOption(
    question: QuizQuestionManagementResponse,
    option: AnswerOptionManagementResponse,
  ): void {
    this.confirm({ kind: 'answer option', name: option.optionText }, () =>
      this.api.deleteOption(this.courseId, this.moduleId, question.id, option.id).subscribe({
        next: () => {
          this.updateQuestion(question.id, (q) => ({
            ...q,
            options: q.options.filter((x) => x.id !== option.id),
          }));
          this.done('Answer option deleted.');
        },
        error: (e) => this.failed(e),
      }),
    );
  }
  private openForm<C, D, R>(component: ComponentType<C>, data: D, save: (result: R) => void): void {
    if (this.submitting()) return;
    this.error.set(null);
    this.dialog
      .open<C, D, R>(component, { data, width: '560px', maxWidth: 'calc(100vw - 24px)' })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.submitting.set(true);
          save(result);
        }
      });
  }
  private confirm(data: QuizDeleteData, action: () => void): void {
    this.dialog
      .open<QuizDeleteDialog, QuizDeleteData, boolean>(QuizDeleteDialog, { data, width: '460px' })
      .afterClosed()
      .subscribe((ok) => {
        if (ok && !this.submitting()) {
          this.submitting.set(true);
          action();
        }
      });
  }
  private updateQuestion(
    id: number,
    change: (q: QuizQuestionManagementResponse) => QuizQuestionManagementResponse,
  ): void {
    this.quiz.update((q) =>
      q ? { ...q, questions: q.questions.map((x) => (x.id === id ? change(x) : x)) } : q,
    );
  }
  private done(text: string): void {
    this.submitting.set(false);
    this.error.set(null);
    this.snackBar.open(text, 'Dismiss', { duration: 3500 });
  }
  private failed(error: HttpErrorResponse, duplicateQuizCreation = false): void {
    this.submitting.set(false);
    this.error.set(this.message(error, duplicateQuizCreation));
  }
  private message(error: HttpErrorResponse, duplicateQuizCreation = false): string {
    if (error.status === 400) return 'Check the entered information and try again.';
    if (error.status === 403) return 'You do not have permission to manage this quiz.';
    if (error.status === 404) return 'The quiz, question, or answer option no longer exists.';
    if (error.status === 409)
      return duplicateQuizCreation
        ? 'This module already has a quiz.'
        : 'The requested quiz change could not be completed.';
    if (error.status === 0)
      return 'Unable to reach SkillForge. Check your connection and try again.';
    return 'Something went wrong. Please try again.';
  }
  private normalized(q: QuizManagementResponse): QuizManagementResponse {
    return {
      ...q,
      questions: this.sort(q.questions).map((question) => ({
        ...question,
        options: this.sort(question.options),
      })),
    };
  }
  private sort<T extends { position: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => a.position - b.position);
  }
  private validId(value: number): boolean {
    return Number.isInteger(value) && value > 0;
  }
}
