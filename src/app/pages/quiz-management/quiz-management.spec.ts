import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { QuizManagementResponse } from '../../models/app.models';
import { QuizManagementService } from '../../services/quiz-management';
import { QuizManagementComponent } from './quiz-management';

describe('QuizManagementComponent', () => {
  function create(
    params = { courseId: '7', moduleId: '3' },
    response: Observable<QuizManagementResponse> = of(quiz),
  ) {
    const api = {
      getQuiz: vi.fn(() => response),
      createQuiz: vi.fn(() => of(quiz)),
      updateQuiz: vi.fn(() => of(quiz)),
      deleteQuiz: vi.fn(() => of(undefined)),
      createQuestion: vi.fn(() => of(createdQuestion)),
      updateQuestion: vi.fn(() => of(editedQuestion)),
      deleteQuestion: vi.fn(() => of(undefined)),
      createOption: vi.fn(() => of(createdOption)),
      updateOption: vi.fn(() => of(editedOption)),
      deleteOption: vi.fn(() => of(undefined)),
    };
    TestBed.configureTestingModule({
      imports: [QuizManagementComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(params) } },
        },
        { provide: QuizManagementService, useValue: api },
      ],
    });
    const fixture = TestBed.createComponent(QuizManagementComponent);
    fixture.detectChanges();
    return {
      fixture,
      component: fixture.componentInstance,
      api,
      dialog: (fixture.componentInstance as unknown as { dialog: MatDialog }).dialog,
    };
  }

  afterEach(() => TestBed.resetTestingModule());

  it('avoids API calls for invalid route IDs', () => {
    const { component, api } = create({ courseId: '0', moduleId: 'x' });
    expect(api.getQuiz).not.toHaveBeenCalled();
    expect(component.error()).toContain('invalid');
  });

  it('loads and displays a sorted quiz', () => {
    const { fixture, component } = create();
    expect(fixture.nativeElement.textContent).toContain('Knowledge Check');
    expect(component.quiz()?.questions[0].position).toBe(1);
  });

  it('links back to module management while preserving the course route id', () => {
    const { fixture } = create({ courseId: '47', moduleId: '3' });
    const link = fixture.nativeElement.querySelector('app-back-navigation a') as HTMLAnchorElement;

    expect(link.textContent).toContain('Back to Module');
    expect(link.getAttribute('href')).toBe('/management/courses/47/modules');
  });

  it('treats GET 404 as the no-quiz empty state', () => {
    const { fixture, component } = create(
      { courseId: '7', moduleId: '3' },
      throwError(() => new HttpErrorResponse({ status: 404 })),
    );
    expect(component.error()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No quiz yet');
  });

  it('maps network errors to an understandable message', () => {
    const { component } = create(
      { courseId: '7', moduleId: '3' },
      throwError(() => new HttpErrorResponse({ status: 0 })),
    );
    expect(component.error()).toContain('Unable to reach SkillForge');
  });

  it('cancel does not delete and confirm deletes the quiz', () => {
    const { component, api, dialog } = create();
    const open = vi.spyOn(dialog, 'open');
    open.mockReturnValueOnce({ afterClosed: () => of(false) } as never);
    component.confirmDeleteQuiz();
    expect(api.deleteQuiz).not.toHaveBeenCalled();
    open.mockReturnValueOnce({ afterClosed: () => of(true) } as never);
    component.confirmDeleteQuiz();
    expect(api.deleteQuiz).toHaveBeenCalledWith(7, 3);
    expect(component.quiz()).toBeNull();
  });

  it('shows the duplicate message only when quiz creation returns 409', () => {
    const { component, api, dialog } = create(
      { courseId: '7', moduleId: '3' },
      throwError(() => new HttpErrorResponse({ status: 404 })),
    );
    vi.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of({ title: 'Quiz', passingScore: 70 }),
    } as never);
    api.createQuiz.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    component.openQuizForm();
    expect(component.error()).toBe('This module already has a quiz.');
  });

  it('uses a neutral message when a non-create operation returns 409', () => {
    const { component, api, dialog } = create();
    vi.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of({ title: 'Updated', passingScore: 70 }),
    } as never);
    api.updateQuiz.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    component.openQuizForm();
    expect(component.error()).toBe('The requested quiz change could not be completed.');
    expect(component.error()).not.toBe('This module already has a quiz.');
  });

  it('updates state after successfully creating a quiz', () => {
    const { component, api, dialog } = create(
      { courseId: '7', moduleId: '3' },
      throwError(() => new HttpErrorResponse({ status: 404 })),
    );
    const createdQuiz = { ...quiz, id: 9, title: 'Created Quiz' };
    vi.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of({ title: 'Created Quiz', passingScore: 70 }),
    } as never);
    api.createQuiz.mockReturnValue(of(createdQuiz));

    component.openQuizForm();

    expect(api.createQuiz).toHaveBeenCalledWith(7, 3, {
      title: 'Created Quiz',
      passingScore: 70,
    });
    expect(component.quiz()?.id).toBe(9);
    expect(component.quiz()?.title).toBe('Created Quiz');
  });

  it('updates state after successfully editing a quiz', () => {
    const { component, api, dialog } = create();
    const updatedQuiz = { ...quiz, title: 'Updated Quiz', passingScore: 80 };
    vi.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of({ title: 'Updated Quiz', passingScore: 80 }),
    } as never);
    api.updateQuiz.mockReturnValue(of(updatedQuiz));

    component.openQuizForm();

    expect(api.updateQuiz).toHaveBeenCalledWith(7, 3, {
      title: 'Updated Quiz',
      passingScore: 80,
    });
    expect(component.quiz()?.title).toBe('Updated Quiz');
    expect(component.quiz()?.passingScore).toBe(80);
  });

  it('adds the backend-returned question', () => {
    const { component, api, dialog } = create();
    vi.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of({ questionText: 'Backend question' }),
    } as never);

    component.openQuestionForm(null);

    expect(api.createQuestion).toHaveBeenCalledWith(7, 3, {
      questionText: 'Backend question',
    });
    expect(component.quiz()?.questions.some((question) => question.id === createdQuestion.id)).toBe(
      true,
    );
  });

  it('replaces the matching question with the backend response', () => {
    const { component, dialog } = create();
    const existing = component.quiz()!.questions[0];
    vi.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of({ questionText: 'Edited question' }),
    } as never);

    component.openQuestionForm(existing);

    expect(component.quiz()?.questions.find((question) => question.id === existing.id)).toEqual(
      editedQuestion,
    );
  });

  it('removes the matching question after confirmed deletion', () => {
    const { component, api, dialog } = create();
    const existing = component.quiz()!.questions[0];
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as never);

    component.confirmDeleteQuestion(existing);

    expect(api.deleteQuestion).toHaveBeenCalledWith(7, 3, existing.id);
    expect(component.quiz()?.questions.some((question) => question.id === existing.id)).toBe(false);
  });

  it('adds the backend-returned answer option', () => {
    const { component, api, dialog } = create();
    const question = component.quiz()!.questions.find((item) => item.id === 1)!;
    vi.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of({ optionText: 'New option', correct: false }),
    } as never);

    component.openOptionForm(question, null);

    expect(api.createOption).toHaveBeenCalledWith(7, 3, question.id, {
      optionText: 'New option',
      correct: false,
    });
    expect(
      component
        .quiz()
        ?.questions.find((item) => item.id === question.id)
        ?.options.some((option) => option.id === createdOption.id),
    ).toBe(true);
  });

  it('replaces the matching option and clears the previous correct marker', () => {
    const { component, dialog } = create();
    const question = component.quiz()!.questions.find((item) => item.id === 1)!;
    const optionToEdit = { id: 2, optionText: 'No', position: 2, correct: false };
    component.quiz.update((current) => ({
      ...current!,
      questions: current!.questions.map((item) =>
        item.id === question.id ? { ...item, options: [...item.options, optionToEdit] } : item,
      ),
    }));
    vi.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of({ optionText: 'Now correct', correct: true }),
    } as never);

    component.openOptionForm(question, optionToEdit);

    const options = component.quiz()!.questions.find((item) => item.id === question.id)!.options;
    expect(options.find((option) => option.id === editedOption.id)).toEqual(editedOption);
    expect(options.find((option) => option.id === 1)?.correct).toBe(false);
  });

  it('removes the matching option after confirmed deletion', () => {
    const { component, api, dialog } = create();
    const question = component.quiz()!.questions.find((item) => item.id === 1)!;
    const option = question.options[0];
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as never);

    component.confirmDeleteOption(question, option);

    expect(api.deleteOption).toHaveBeenCalledWith(7, 3, question.id, option.id);
    expect(
      component.quiz()!.questions.find((item) => item.id === question.id)!.options,
    ).not.toContainEqual(option);
  });
});

const quiz: QuizManagementResponse = {
  id: 1,
  title: 'Knowledge Check',
  passingScore: 70,
  questions: [
    { id: 2, questionText: 'Second', position: 2, options: [] },
    {
      id: 1,
      questionText: 'First',
      position: 1,
      options: [{ id: 1, optionText: 'Yes', position: 1, correct: true }],
    },
  ],
};

const createdQuestion = {
  id: 8,
  questionText: 'Backend question',
  position: 3,
  options: [],
};
const editedQuestion = {
  id: 1,
  questionText: 'Edited question',
  position: 1,
  options: [{ id: 1, optionText: 'Yes', position: 1, correct: true }],
};
const createdOption = { id: 3, optionText: 'New option', position: 2, correct: false };
const editedOption = { id: 2, optionText: 'Now correct', position: 2, correct: true };
