import { QuizAnswerOption } from './app.models';

type AssertFalse<T extends false> = T;
type LearnerOptionMustNotExposeCorrect = AssertFalse<
  'correct' extends keyof QuizAnswerOption ? true : false
>;

describe('learner quiz model security', () => {
  it('does not expose answer correctness', () => {
    const option: QuizAnswerOption = { id: 1, optionText: 'Answer', position: 1 };
    const compileTimeAssertion: LearnerOptionMustNotExposeCorrect = false;

    expect(compileTimeAssertion).toBe(false);
    expect('correct' in option).toBe(false);
  });
});
