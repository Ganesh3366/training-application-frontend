import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Certificate,
  Course,
  CourseModule,
  CourseModuleDetail,
  CourseProgress,
  ModuleQuiz,
  QuizResult,
  QuizSubmission,
} from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly http = inject(HttpClient);

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>('/api/courses');
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`/api/courses/${id}`);
  }

  getModules(courseId: number): Observable<CourseModule[]> {
    return this.http.get<CourseModule[]>(`/api/courses/${courseId}/modules`);
  }

  getCourseProgress(courseId: number): Observable<CourseProgress> {
    return this.http.get<CourseProgress>(`/api/courses/${courseId}/progress`);
  }

  getCertificate(courseId: number): Observable<Certificate> {
    return this.http.get<Certificate>(`/api/courses/${courseId}/certificate`);
  }

  getModule(courseId: number, moduleId: number): Observable<CourseModuleDetail> {
    return this.http.get<CourseModuleDetail>(`/api/courses/${courseId}/modules/${moduleId}`);
  }

  getQuiz(courseId: number, moduleId: number): Observable<ModuleQuiz> {
    return this.http.get<ModuleQuiz>(`/api/courses/${courseId}/modules/${moduleId}/quiz`);
  }

  submitQuiz(
    courseId: number,
    moduleId: number,
    submission: QuizSubmission,
  ): Observable<QuizResult> {
    return this.http.post<QuizResult>(
      `/api/courses/${courseId}/modules/${moduleId}/quiz/submit`,
      submission,
    );
  }
}
