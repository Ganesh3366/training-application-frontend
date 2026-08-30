import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AnswerOptionManagementRequest,
  AnswerOptionManagementResponse,
  QuizManagementRequest,
  QuizManagementResponse,
  QuizQuestionManagementRequest,
  QuizQuestionManagementResponse,
} from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class QuizManagementService {
  private readonly http = inject(HttpClient);

  getQuiz(courseId: number, moduleId: number): Observable<QuizManagementResponse> {
    return this.http.get<QuizManagementResponse>(this.baseUrl(courseId, moduleId));
  }
  createQuiz(
    courseId: number,
    moduleId: number,
    body: QuizManagementRequest,
  ): Observable<QuizManagementResponse> {
    return this.http.post<QuizManagementResponse>(this.baseUrl(courseId, moduleId), body);
  }
  updateQuiz(
    courseId: number,
    moduleId: number,
    body: QuizManagementRequest,
  ): Observable<QuizManagementResponse> {
    return this.http.put<QuizManagementResponse>(this.baseUrl(courseId, moduleId), body);
  }
  deleteQuiz(courseId: number, moduleId: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl(courseId, moduleId));
  }
  createQuestion(
    courseId: number,
    moduleId: number,
    body: QuizQuestionManagementRequest,
  ): Observable<QuizQuestionManagementResponse> {
    return this.http.post<QuizQuestionManagementResponse>(
      this.questionsUrl(courseId, moduleId),
      body,
    );
  }
  updateQuestion(
    courseId: number,
    moduleId: number,
    questionId: number,
    body: QuizQuestionManagementRequest,
  ): Observable<QuizQuestionManagementResponse> {
    return this.http.put<QuizQuestionManagementResponse>(
      `${this.questionsUrl(courseId, moduleId)}/${questionId}`,
      body,
    );
  }
  deleteQuestion(courseId: number, moduleId: number, questionId: number): Observable<void> {
    return this.http.delete<void>(`${this.questionsUrl(courseId, moduleId)}/${questionId}`);
  }
  createOption(
    courseId: number,
    moduleId: number,
    questionId: number,
    body: AnswerOptionManagementRequest,
  ): Observable<AnswerOptionManagementResponse> {
    return this.http.post<AnswerOptionManagementResponse>(
      this.optionsUrl(courseId, moduleId, questionId),
      body,
    );
  }
  updateOption(
    courseId: number,
    moduleId: number,
    questionId: number,
    optionId: number,
    body: AnswerOptionManagementRequest,
  ): Observable<AnswerOptionManagementResponse> {
    return this.http.put<AnswerOptionManagementResponse>(
      `${this.optionsUrl(courseId, moduleId, questionId)}/${optionId}`,
      body,
    );
  }
  deleteOption(
    courseId: number,
    moduleId: number,
    questionId: number,
    optionId: number,
  ): Observable<void> {
    return this.http.delete<void>(`${this.optionsUrl(courseId, moduleId, questionId)}/${optionId}`);
  }
  private baseUrl(courseId: number, moduleId: number): string {
    return `/api/management/courses/${courseId}/modules/${moduleId}/quiz`;
  }
  private questionsUrl(courseId: number, moduleId: number): string {
    return `${this.baseUrl(courseId, moduleId)}/questions`;
  }
  private optionsUrl(courseId: number, moduleId: number, questionId: number): string {
    return `${this.questionsUrl(courseId, moduleId)}/${questionId}/options`;
  }
}
