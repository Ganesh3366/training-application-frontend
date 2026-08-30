import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import {
  AnswerOptionManagementRequest,
  QuizManagementRequest,
  QuizQuestionManagementRequest,
} from '../models/app.models';
import { QuizManagementService } from './quiz-management';

describe('QuizManagementService', () => {
  let service: QuizManagementService;
  let http: HttpTestingController;
  const base = '/api/management/courses/7/modules/3/quiz';
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(QuizManagementService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  const quiz: QuizManagementRequest = { title: 'Check', passingScore: 70 };
  const question: QuizQuestionManagementRequest = { questionText: 'Why?' };
  const option: AnswerOptionManagementRequest = { optionText: 'Because', correct: true };
  it.each([
    ['getQuiz', () => service.getQuiz(7, 3), 'GET', undefined, base],
    ['createQuiz', () => service.createQuiz(7, 3, quiz), 'POST', quiz, base],
    ['updateQuiz', () => service.updateQuiz(7, 3, quiz), 'PUT', quiz, base],
    ['deleteQuiz', () => service.deleteQuiz(7, 3), 'DELETE', undefined, base],
    [
      'createQuestion',
      () => service.createQuestion(7, 3, question),
      'POST',
      question,
      `${base}/questions`,
    ],
    [
      'updateQuestion',
      () => service.updateQuestion(7, 3, 11, question),
      'PUT',
      question,
      `${base}/questions/11`,
    ],
    [
      'deleteQuestion',
      () => service.deleteQuestion(7, 3, 11),
      'DELETE',
      undefined,
      `${base}/questions/11`,
    ],
    [
      'createOption',
      () => service.createOption(7, 3, 11, option),
      'POST',
      option,
      `${base}/questions/11/options`,
    ],
    [
      'updateOption',
      () => service.updateOption(7, 3, 11, 12, option),
      'PUT',
      option,
      `${base}/questions/11/options/12`,
    ],
    [
      'deleteOption',
      () => service.deleteOption(7, 3, 11, 12),
      'DELETE',
      undefined,
      `${base}/questions/11/options/12`,
    ],
  ] as const)('%s uses the management endpoint', (_name, call, method, body, url) => {
    const response = call() as Observable<unknown>;
    response.subscribe();
    const req = http.expectOne(url);
    expect(req.request.method).toBe(method);
    if (body) expect(req.request.body).toEqual(body);
    req.flush(method === 'DELETE' ? null : {});
  });
});
