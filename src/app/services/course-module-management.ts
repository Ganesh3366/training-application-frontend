import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CourseModule,
  CourseModuleManagementRequest,
  ModuleContent,
  ModuleContentManagementRequest,
} from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class CourseModuleManagementService {
  private readonly http = inject(HttpClient);

  getModules(courseId: number): Observable<CourseModule[]> {
    return this.http.get<CourseModule[]>(this.modulesUrl(courseId));
  }

  createModule(courseId: number, request: CourseModuleManagementRequest): Observable<CourseModule> {
    return this.http.post<CourseModule>(this.modulesUrl(courseId), request);
  }

  updateModule(
    courseId: number,
    moduleId: number,
    request: CourseModuleManagementRequest,
  ): Observable<CourseModule> {
    return this.http.put<CourseModule>(`${this.modulesUrl(courseId)}/${moduleId}`, request);
  }

  deleteModule(courseId: number, moduleId: number): Observable<void> {
    return this.http.delete<void>(`${this.modulesUrl(courseId)}/${moduleId}`);
  }

  getContents(courseId: number, moduleId: number): Observable<ModuleContent[]> {
    return this.http.get<ModuleContent[]>(this.contentsUrl(courseId, moduleId));
  }

  createContent(
    courseId: number,
    moduleId: number,
    request: ModuleContentManagementRequest,
  ): Observable<ModuleContent> {
    return this.http.post<ModuleContent>(this.contentsUrl(courseId, moduleId), request);
  }

  updateContent(
    courseId: number,
    moduleId: number,
    contentId: number,
    request: ModuleContentManagementRequest,
  ): Observable<ModuleContent> {
    return this.http.put<ModuleContent>(
      `${this.contentsUrl(courseId, moduleId)}/${contentId}`,
      request,
    );
  }

  deleteContent(courseId: number, moduleId: number, contentId: number): Observable<void> {
    return this.http.delete<void>(`${this.contentsUrl(courseId, moduleId)}/${contentId}`);
  }

  private modulesUrl(courseId: number): string {
    return `/api/management/courses/${courseId}/modules`;
  }

  private contentsUrl(courseId: number, moduleId: number): string {
    return `${this.modulesUrl(courseId)}/${moduleId}/contents`;
  }
}
