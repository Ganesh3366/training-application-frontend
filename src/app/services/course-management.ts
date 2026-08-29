import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CourseManagementRequest,
  CourseManagementResponse,
} from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class CourseManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/management/courses';

  getCourses(): Observable<CourseManagementResponse[]> {
    return this.http.get<CourseManagementResponse[]>(this.apiUrl);
  }

  getCourse(id: number): Observable<CourseManagementResponse> {
    return this.http.get<CourseManagementResponse>(`${this.apiUrl}/${id}`);
  }

  createCourse(request: CourseManagementRequest): Observable<CourseManagementResponse> {
    return this.http.post<CourseManagementResponse>(this.apiUrl, request);
  }

  updateCourse(
    id: number,
    request: CourseManagementRequest,
  ): Observable<CourseManagementResponse> {
    return this.http.put<CourseManagementResponse>(`${this.apiUrl}/${id}`, request);
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
