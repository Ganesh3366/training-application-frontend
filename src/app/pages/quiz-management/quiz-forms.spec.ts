import { ComponentType } from '@angular/cdk/portal';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  OptionFormComponent,
  QuestionFormComponent,
  QuizDeleteDialog,
  QuizFormComponent,
} from './quiz-forms';

describe('quiz management dialogs', () => {
  function make<T>(component: ComponentType<T>, data: unknown): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [component],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    });
    return TestBed.createComponent(component);
  }

  afterEach(() => TestBed.resetTestingModule());

  it('rejects a blank quiz title', () => {
    const component = make(QuizFormComponent, { quiz: null }).componentInstance;
    component.form.setValue({ title: '   ', passingScore: 50 });
    expect(component.form.invalid).toBe(true);
  });

  it.each([-1, 101, 50.5])('rejects invalid passing score %s', (passingScore) => {
    const component = make(QuizFormComponent, { quiz: null }).componentInstance;
    component.form.setValue({ title: 'Quiz', passingScore });
    expect(component.form.invalid).toBe(true);
  });

  it('rejects a blank question', () => {
    const component = make(QuestionFormComponent, { question: null }).componentInstance;
    component.form.setValue({ questionText: '  ' });
    expect(component.form.invalid).toBe(true);
  });

  it('rejects a blank answer option', () => {
    const component = make(OptionFormComponent, { option: null }).componentInstance;
    component.form.setValue({ optionText: '  ', correct: false });
    expect(component.form.invalid).toBe(true);
  });

  it('returns the selected correct boolean', () => {
    const fixture = make(OptionFormComponent, { option: null });
    const component = fixture.componentInstance;
    const close = vi.spyOn(component.ref, 'close');
    component.form.setValue({ optionText: 'Correct choice', correct: true });
    component.submit();
    expect(close).toHaveBeenCalledWith({ optionText: 'Correct choice', correct: true });
  });

  it('returns false on delete cancellation and true on confirmation', () => {
    const fixture = make(QuizDeleteDialog, { kind: 'quiz', name: 'Check' });
    fixture.detectChanges();
    const close = vi.spyOn(fixture.componentInstance.ref, 'close');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    buttons[1].click();
    expect(close).toHaveBeenNthCalledWith(1, false);
    expect(close).toHaveBeenNthCalledWith(2, true);
  });
});
