import { HttpErrorResponse } from '@angular/common/http';
import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { AppUser, CourseModuleDetail, ModuleQuiz, QuizResult, QuizSubmission } from '../../models/app.models';
import { AuthService } from '../../services/auth';
import { CourseService } from '../../services/course';
import { ModuleLearning } from './module-learning';

describe('ModuleLearning', () => {
  function create(
    response: Observable<CourseModuleDetail>,
    courseId = '3',
    moduleId = '9',
    getModule = () => response,
    quizResponse: Observable<ModuleQuiz> = of(moduleQuiz),
    getQuiz = () => quizResponse,
    submissionResponse: Observable<QuizResult> = of(passedResult),
    submitQuiz = (_courseId: number, _moduleId: number, _submission: QuizSubmission) => submissionResponse,
    currentUser = signal<AppUser | null>(user),
    authResolved = signal(true),
  ): ComponentFixture<ModuleLearning> {
    TestBed.configureTestingModule({
      imports: [ModuleLearning],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ courseId, moduleId }) } } },
        { provide: CourseService, useValue: { getModule, getQuiz, submitQuiz } },
        {
          provide: AuthService,
          useValue: { currentUser, authResolved, isLoggedIn: computed(() => currentUser() !== null) },
        },
      ],
    });
    const fixture = TestBed.createComponent(ModuleLearning);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('displays the module title, description, and TEXT content', () => {
    const fixture = create(of(moduleDetail));
    expect(fixture.nativeElement.textContent).toContain('HTTP Foundations');
    expect(fixture.nativeElement.textContent).toContain('Learn request fundamentals.');
    expect(fixture.nativeElement.textContent).toContain('Plain text lesson');
  });

  it('links back to the current course using the course route id', () => {
    const fixture = create(of(moduleDetail), '47', '9');
    const link = fixture.nativeElement.querySelector(
      'app-back-navigation a',
    ) as HTMLAnchorElement;

    expect(link.textContent).toContain('Back to Course');
    expect(link.getAttribute('href')).toBe('/courses/47');
  });

  it('embeds a validated YouTube URL', () => {
    const fixture = create(of(withVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ')));
    const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute('src')).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ');
    expect(iframe.title).toBe('Watch this');
  });

  it('rejects non-YouTube video URLs', () => {
    const fixture = create(of(withVideo('https://example.com/watch?v=dQw4w9WgXcQ')));
    expect(fixture.nativeElement.querySelector('iframe')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Video unavailable.');
  });

  it('shows a fallback when TEXT content is missing', () => {
    const detail: CourseModuleDetail = {
      ...moduleDetail,
      contents: [{ ...moduleDetail.contents[0], textContent: '  ' }],
    };
    expect(create(of(detail)).nativeElement.textContent).toContain('Content unavailable.');
  });

  it('shows module not found for a 404', () => {
    const error = new HttpErrorResponse({ status: 404 });
    expect(create(throwError(() => error)).nativeElement.textContent).toContain('Module not found.');
  });

  it('shows a safe general API error', () => {
    const error = new HttpErrorResponse({ status: 500 });
    expect(create(throwError(() => error)).nativeElement.textContent).toContain('Unable to load module.');
  });

  it('shows the empty content state', () => {
    expect(create(of({ ...moduleDetail, contents: [] })).nativeElement.textContent)
      .toContain('No content is available for this module yet.');
  });

  it('rejects invalid route ids without calling the service', () => {
    const getModule = vi.fn(() => of(moduleDetail));
    const fixture = create(of(moduleDetail), '0', 'not-a-number', getModule);
    expect(fixture.nativeElement.textContent).toContain('Module not found.');
    expect(getModule).not.toHaveBeenCalled();
  });

  it('loads the quiz for valid route ids and renders its questions and options', () => {
    const getQuiz = vi.fn(() => of(moduleQuiz));
    const fixture = create(of(moduleDetail), '3', '9', () => of(moduleDetail), of(moduleQuiz), getQuiz);

    expect(getQuiz).toHaveBeenCalledWith(3, 9);
    expect(fixture.nativeElement.textContent).toContain('HTTP Knowledge Check');
    expect(fixture.nativeElement.querySelectorAll('fieldset')).toHaveLength(2);
    expect(fixture.nativeElement.querySelectorAll('input[type="radio"]')).toHaveLength(4);
  });

  it('keeps submit disabled until every question has an answer', () => {
    const fixture = create(of(moduleDetail));
    const submit = fixture.nativeElement.querySelector('.submit-quiz') as HTMLButtonElement;
    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;

    expect(submit.disabled).toBe(true);
    radios[0].click();
    fixture.detectChanges();
    expect(submit.disabled).toBe(true);
    radios[2].click();
    fixture.detectChanges();
    expect(submit.disabled).toBe(false);
  });

  it('submits only the selected question and option ids', () => {
    const submitQuiz = vi.fn(() => of(passedResult));
    const fixture = create(
      of(moduleDetail), '3', '9', () => of(moduleDetail), of(moduleQuiz), () => of(moduleQuiz),
      of(passedResult), submitQuiz,
    );
    selectAllAnswers(fixture);
    (fixture.nativeElement.querySelector('.submit-quiz') as HTMLButtonElement).click();

    expect(submitQuiz).toHaveBeenCalledWith(3, 9, {
      answers: [{ questionId: 201, optionId: 301 }, { questionId: 202, optionId: 303 }],
    });
  });

  it('renders the backend-authoritative passed result without a retry action', () => {
    const fixture = create(of(moduleDetail));
    selectAllAnswers(fixture);
    (fixture.nativeElement.querySelector('.submit-quiz') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Passed');
    expect(fixture.nativeElement.textContent).toContain('Score: 100%');
    expect(fixture.nativeElement.textContent).toContain('Correct answers: 2 / 2');
    expect(fixture.nativeElement.querySelector('.retry-quiz')).toBeNull();
  });

  it('shows Retry Quiz for a failed result and retry clears result and selections', () => {
    const failedResult: QuizResult = { ...passedResult, correctAnswers: 1, score: 50, passed: false };
    const fixture = create(
      of(moduleDetail), '3', '9', () => of(moduleDetail), of(moduleQuiz), () => of(moduleQuiz),
      of(failedResult), () => of(failedResult),
    );
    selectAllAnswers(fixture);
    (fixture.nativeElement.querySelector('.submit-quiz') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Not Passed');

    (fixture.nativeElement.querySelector('.retry-quiz') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.quiz-result')).toBeNull();
    expect([...fixture.nativeElement.querySelectorAll('input[type="radio"]')]
      .every((radio: HTMLInputElement) => !radio.checked)).toBe(true);
    expect((fixture.nativeElement.querySelector('.submit-quiz') as HTMLButtonElement).disabled).toBe(true);
  });

  it('keeps module content visible when the quiz is unavailable', () => {
    const quizError = new HttpErrorResponse({ status: 404 });
    const fixture = create(
      of(moduleDetail), '3', '9', () => of(moduleDetail), throwError(() => quizError),
    );
    expect(fixture.nativeElement.textContent).toContain('Plain text lesson');
    expect(fixture.nativeElement.textContent).toContain('Quiz is not available for this module yet.');
  });

  it('preserves selected answers after a submission error', () => {
    const fixture = create(
      of(moduleDetail), '3', '9', () => of(moduleDetail), of(moduleQuiz), () => of(moduleQuiz),
      throwError(() => new Error('server error')),
    );
    selectAllAnswers(fixture);
    (fixture.nativeElement.querySelector('.submit-quiz') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Unable to submit quiz. Please try again.');
    expect([...fixture.nativeElement.querySelectorAll('input[type="radio"]')]
      .filter((radio: HTMLInputElement) => radio.checked)).toHaveLength(2);
    expect((fixture.nativeElement.querySelector('.submit-quiz') as HTMLButtonElement).disabled).toBe(false);
  });

  it('shows module content and a login message without requesting the quiz when logged out', () => {
    const getQuiz = vi.fn(() => of(moduleQuiz));
    const fixture = create(
      of(moduleDetail), '3', '9', () => of(moduleDetail), of(moduleQuiz), getQuiz,
      of(passedResult), () => of(passedResult), signal<AppUser | null>(null), signal(true),
    );
    expect(fixture.nativeElement.textContent).toContain('Plain text lesson');
    expect(fixture.nativeElement.textContent).toContain('Log in to take this quiz.');
    expect(getQuiz).not.toHaveBeenCalled();
  });

  it('loads the quiz when the user logs in without leaving the page', () => {
    const currentUser = signal<AppUser | null>(null);
    const getQuiz = vi.fn(() => of(moduleQuiz));
    const fixture = create(
      of(moduleDetail), '3', '9', () => of(moduleDetail), of(moduleQuiz), getQuiz,
      of(passedResult), () => of(passedResult), currentUser, signal(true),
    );
    currentUser.set(user);
    fixture.detectChanges();
    expect(getQuiz).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.textContent).toContain('HTTP Knowledge Check');
  });

  it('clears quiz state on logout and loads a fresh quiz after login again', () => {
    const currentUser = signal<AppUser | null>(user);
    const getQuiz = vi.fn(() => of(moduleQuiz));
    const fixture = create(
      of(moduleDetail), '3', '9', () => of(moduleDetail), of(moduleQuiz), getQuiz,
      of(passedResult), () => of(passedResult), currentUser, signal(true),
    );
    selectAllAnswers(fixture);
    (fixture.nativeElement.querySelector('.submit-quiz') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.quiz-result')).not.toBeNull();

    currentUser.set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('fieldset')).toBeNull();
    expect(fixture.nativeElement.querySelector('.quiz-result')).toBeNull();
    expect(fixture.componentInstance.selectedAnswers().size).toBe(0);
    expect(fixture.componentInstance.submissionError()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Log in to take this quiz.');

    currentUser.set(user);
    fixture.detectChanges();
    expect(getQuiz).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.textContent).toContain('HTTP Knowledge Check');
  });

  it('shows pending access state until auth restoration resolves, then loads once', () => {
    const currentUser = signal<AppUser | null>(null);
    const authResolved = signal(false);
    const getQuiz = vi.fn(() => of(moduleQuiz));
    const fixture = create(
      of(moduleDetail), '3', '9', () => of(moduleDetail), of(moduleQuiz), getQuiz,
      of(passedResult), () => of(passedResult), currentUser, authResolved,
    );
    expect(fixture.nativeElement.textContent).toContain('Checking quiz access...');
    expect(fixture.nativeElement.textContent).not.toContain('Log in to take this quiz.');
    expect(getQuiz).not.toHaveBeenCalled();

    currentUser.set(user);
    authResolved.set(true);
    fixture.detectChanges();
    expect(getQuiz).toHaveBeenCalledTimes(1);
  });
});

const moduleDetail: CourseModuleDetail = {
  id: 9,
  title: 'HTTP Foundations',
  description: 'Learn request fundamentals.',
  position: 1,
  contents: [{
    id: 100,
    type: 'TEXT',
    title: 'Read this',
    textContent: 'Plain text lesson',
    videoUrl: null,
    position: 1,
  }],
};

function withVideo(videoUrl: string): CourseModuleDetail {
  return {
    ...moduleDetail,
    contents: [{
      id: 101,
      type: 'VIDEO',
      title: 'Watch this',
      textContent: null,
      videoUrl,
      position: 1,
    }],
  };
}

const moduleQuiz: ModuleQuiz = {
  id: 20,
  title: 'HTTP Knowledge Check',
  passingScore: 70,
  questions: [
    {
      id: 201,
      questionText: 'Which method reads data?',
      position: 1,
      options: [
        { id: 301, optionText: 'GET', position: 1 },
        { id: 302, optionText: 'POST', position: 2 },
      ],
    },
    {
      id: 202,
      questionText: 'Which status means success?',
      position: 2,
      options: [
        { id: 303, optionText: '200', position: 1 },
        { id: 304, optionText: '500', position: 2 },
      ],
    },
  ],
};

const passedResult: QuizResult = {
  totalQuestions: 2,
  correctAnswers: 2,
  score: 100,
  passingScore: 70,
  passed: true,
};

const user: AppUser = { id: 1, name: 'Ganesh', email: 'ganesh@example.com', role: 'USER', enabled: true };

function selectAllAnswers(fixture: ComponentFixture<ModuleLearning>): void {
  const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
  radios[0].click();
  radios[2].click();
  fixture.detectChanges();
}
