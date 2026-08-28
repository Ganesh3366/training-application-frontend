import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  CourseModuleDetail,
  ModuleContent,
  ModuleQuiz,
  QuizResult,
  QuizSubmission,
} from '../../models/app.models';
import { CourseService } from '../../services/course';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-module-learning',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="learning-page">
      <a class="back-link" [routerLink]="['/courses', courseId]">Back to Course</a>
      @if (loading()) {
        <section><p role="status">Loading module...</p></section>
      } @else if (errorMessage()) {
        <section>
          <h1>{{ errorMessage() }}</h1>
          @if (notFound()) { <p>The requested module does not exist.</p> }
        </section>
      } @else if (module(); as selectedModule) {
        <section>
          <h1>{{ selectedModule.title }}</h1>
          @if (selectedModule.description) { <p>{{ selectedModule.description }}</p> }

          @if (selectedModule.contents.length === 0) {
            <p class="empty-message">No content is available for this module yet.</p>
          } @else {
            <div class="content-list">
              @for (content of selectedModule.contents; track content.id) {
                <article>
                  <h2>{{ content.title }}</h2>
                  @if (content.type === 'TEXT') {
                    <p class="text-content">{{ content.textContent?.trim() || 'Content unavailable.' }}</p>
                  } @else if (content.type === 'VIDEO') {
                    @if (videoEmbedUrl(content); as embedUrl) {
                      <div class="video-frame">
                        <iframe
                          [src]="embedUrl"
                          [title]="content.title"
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen>
                        </iframe>
                      </div>
                    } @else {
                      <p>Video unavailable.</p>
                    }
                  }
                </article>
              }
            </div>
          }
        </section>

        @if (!authResolved()) {
          <section class="quiz-section"><p role="status">Checking quiz access...</p></section>
        } @else if (!isLoggedIn()) {
          <section class="quiz-section">
            <h2>Quiz</h2>
            <p role="status">Log in to take this quiz.</p>
          </section>
        } @else if (quizLoading()) {
          <section class="quiz-section"><p role="status">Loading quiz...</p></section>
        } @else if (quizUnavailable()) {
          <section class="quiz-section"><p>Quiz is not available for this module yet.</p></section>
        } @else if (quizLoadError()) {
          <section class="quiz-section"><p role="alert">{{ quizLoadError() }}</p></section>
        } @else if (quiz(); as moduleQuiz) {
          <section class="quiz-section">
            <h2>{{ moduleQuiz.title }}</h2>
            <p>Passing score: {{ moduleQuiz.passingScore }}%</p>

            @if (moduleQuiz.questions.length === 0) {
              <p>No quiz questions are available yet.</p>
            } @else {
              <form (submit)="submitQuiz($event)">
                @for (question of moduleQuiz.questions; track question.id) {
                  <fieldset>
                    <legend>{{ question.questionText }}</legend>
                    @for (option of question.options; track option.id) {
                      <div class="quiz-option">
                        <input
                          type="radio"
                          [id]="'quiz-option-' + option.id"
                          [name]="'quiz-question-' + question.id"
                          [value]="option.id"
                          [checked]="selectedAnswers().get(question.id) === option.id"
                          [disabled]="submissionLoading() || quizResult() !== null"
                          (change)="selectAnswer(question.id, option.id)">
                        <label [for]="'quiz-option-' + option.id">{{ option.optionText }}</label>
                      </div>
                    }
                  </fieldset>
                }

                @if (!quizResult()) {
                  <button
                    class="submit-quiz"
                    type="submit"
                    [disabled]="!allQuestionsAnswered() || submissionLoading()">
                    {{ submissionLoading() ? 'Submitting...' : 'Submit Quiz' }}
                  </button>
                }
              </form>

              @if (submissionError()) {
                <p class="quiz-error" role="alert">{{ submissionError() }}</p>
              }

              @if (quizResult(); as result) {
                <div class="quiz-result" role="status" aria-live="polite">
                  <h3>{{ result.passed ? 'Passed' : 'Not Passed' }}</h3>
                  <p>Score: {{ result.score }}%</p>
                  <p>Correct answers: {{ result.correctAnswers }} / {{ result.totalQuestions }}</p>
                  <p>Passing score: {{ result.passingScore }}%</p>
                  @if (!result.passed) {
                    <button class="retry-quiz" type="button" (click)="retryQuiz()">Retry Quiz</button>
                  }
                </div>
              }
            }
          </section>
        }
      }
    </div>
  `,
  styles: `
    :host { display: block; background: #f6f9ff; }
    .learning-page { max-width: 900px; margin: 0 auto; padding: 36px; }
    section, article { border: 1px solid #dce7f5; border-radius: 14px; background: #fff; }
    section { margin-top: 18px; padding: 28px; box-shadow: 0 12px 32px rgba(19, 61, 112, 0.09); }
    article { padding: 20px; }
    h1, h2 { color: #06183a; }
    h1, h2 { margin-top: 0; }
    h2 { font-size: 19px; }
    p { color: #536073; line-height: 1.6; }
    .back-link { color: #0873db; font-weight: 700; }
    .content-list { display: grid; gap: 16px; margin-top: 24px; }
    .text-content { white-space: pre-wrap; }
    .video-frame { position: relative; width: 100%; padding-top: 56.25%; overflow: hidden; border-radius: 10px; background: #06183a; }
    iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
    .empty-message { margin-top: 24px; }
    .quiz-section h2 { font-size: 24px; }
    fieldset { margin: 20px 0; padding: 18px; border: 1px solid #dce7f5; border-radius: 10px; }
    legend { padding: 0 6px; color: #06183a; font-weight: 700; }
    .quiz-option { display: flex; align-items: flex-start; gap: 10px; margin-top: 12px; }
    .quiz-option input { margin-top: 3px; accent-color: #0873db; }
    .quiz-option input:focus-visible { outline: 3px solid #73b7f5; outline-offset: 3px; }
    .quiz-option label { color: #17243a; line-height: 1.4; cursor: pointer; }
    button { padding: 10px 16px; border: 0; border-radius: 8px; color: #fff; background: #0873db; font: inherit; font-weight: 700; cursor: pointer; }
    button:focus-visible { outline: 3px solid #06183a; outline-offset: 3px; }
    button:disabled { color: #718096; background: #dce7f5; cursor: not-allowed; }
    .quiz-error { color: #9b1c1c; font-weight: 700; }
    .quiz-result { margin-top: 20px; padding: 18px; border: 2px solid #0873db; border-radius: 10px; }
    .quiz-result h3 { margin-top: 0; color: #06183a; }
    @media (max-width: 640px) { .learning-page { padding: 22px 18px; } section { padding: 20px; } }
  `,
})
export class ModuleLearning {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  private readonly auth = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly courseId = Number(this.route.snapshot.paramMap.get('courseId'));
  readonly moduleId = Number(this.route.snapshot.paramMap.get('moduleId'));
  readonly module = signal<CourseModuleDetail | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly authResolved = this.auth.authResolved;
  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly quiz = signal<ModuleQuiz | null>(null);
  readonly quizLoading = signal(false);
  readonly quizUnavailable = signal(false);
  readonly quizLoadError = signal<string | null>(null);
  readonly selectedAnswers = signal<ReadonlyMap<number, number>>(new Map());
  readonly submissionLoading = signal(false);
  readonly submissionError = signal<string | null>(null);
  readonly quizResult = signal<QuizResult | null>(null);
  readonly allQuestionsAnswered = computed(() => {
    const questions = this.quiz()?.questions ?? [];
    return questions.length > 0 && questions.every((question) => this.selectedAnswers().has(question.id));
  });
  private quizStateVersion = 0;

  constructor() {
    if (!this.isPositiveInteger(this.courseId) || !this.isPositiveInteger(this.moduleId)) {
      this.showNotFound();
      return;
    }

    this.courseService.getModule(this.courseId, this.moduleId).subscribe({
      next: (module) => {
        this.module.set(module);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) this.showNotFound();
        else {
          this.errorMessage.set('Unable to load module.');
          this.loading.set(false);
        }
      },
    });

    effect(() => {
      const authResolved = this.authResolved();
      const user = this.auth.currentUser();
      this.quizStateVersion++;
      this.resetQuizState();

      if (authResolved && user) this.loadQuiz(this.quizStateVersion);
    });
  }

  private loadQuiz(version: number): void {
    this.quizLoading.set(true);
    this.courseService.getQuiz(this.courseId, this.moduleId).subscribe({
      next: (quiz) => {
        if (version !== this.quizStateVersion) return;
        this.quiz.set(quiz);
        this.quizLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        if (version !== this.quizStateVersion) return;
        if (error.status === 404) this.quizUnavailable.set(true);
        else this.quizLoadError.set('Unable to load quiz. Please try again later.');
        this.quizLoading.set(false);
      },
    });
  }

  private resetQuizState(): void {
    this.quiz.set(null);
    this.quizLoading.set(false);
    this.quizUnavailable.set(false);
    this.quizLoadError.set(null);
    this.selectedAnswers.set(new Map());
    this.submissionLoading.set(false);
    this.submissionError.set(null);
    this.quizResult.set(null);
  }

  selectAnswer(questionId: number, optionId: number): void {
    const answers = new Map(this.selectedAnswers());
    answers.set(questionId, optionId);
    this.selectedAnswers.set(answers);
  }

  submitQuiz(event: Event): void {
    event.preventDefault();
    const quiz = this.quiz();
    if (!quiz || !this.allQuestionsAnswered() || this.submissionLoading()) return;

    const submission: QuizSubmission = {
      answers: quiz.questions.map((question) => ({
        questionId: question.id,
        optionId: this.selectedAnswers().get(question.id)!,
      })),
    };

    this.submissionLoading.set(true);
    this.submissionError.set(null);
    const version = this.quizStateVersion;
    this.courseService.submitQuiz(this.courseId, this.moduleId, submission).subscribe({
      next: (result) => {
        if (version !== this.quizStateVersion) return;
        this.quizResult.set(result);
        this.submissionLoading.set(false);
      },
      error: () => {
        if (version !== this.quizStateVersion) return;
        this.submissionError.set('Unable to submit quiz. Please try again.');
        this.submissionLoading.set(false);
      },
    });
  }

  retryQuiz(): void {
    this.selectedAnswers.set(new Map());
    this.quizResult.set(null);
    this.submissionError.set(null);
  }

  videoEmbedUrl(content: ModuleContent): SafeResourceUrl | null {
    const videoId = this.youtubeVideoId(content.videoUrl);
    return videoId
      ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`)
      : null;
  }

  private youtubeVideoId(value: string | null): string | null {
    if (!value) return null;

    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.port || url.username || url.password) return null;

      let videoId: string | null = null;
      if (url.hostname === 'www.youtube.com' && url.pathname === '/watch') {
        videoId = url.searchParams.get('v');
      } else if (url.hostname === 'www.youtube.com' && url.pathname.startsWith('/embed/')) {
        const parts = url.pathname.split('/').filter(Boolean);
        videoId = parts.length === 2 ? parts[1] : null;
      } else if (url.hostname === 'youtu.be') {
        const parts = url.pathname.split('/').filter(Boolean);
        videoId = parts.length === 1 ? parts[0] : null;
      }

      return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId) ? videoId : null;
    } catch {
      return null;
    }
  }

  private isPositiveInteger(value: number): boolean {
    return Number.isInteger(value) && value > 0;
  }

  private showNotFound(): void {
    this.notFound.set(true);
    this.errorMessage.set('Module not found.');
    this.loading.set(false);
  }
}
