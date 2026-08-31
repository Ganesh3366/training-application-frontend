import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUser, CourseAssignment, CourseAssignmentRequest } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/admin/users';

  getUsers(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.apiUrl);
  }

  getAssignments(userId: number): Observable<CourseAssignment[]> {
    return this.http.get<CourseAssignment[]>(`${this.apiUrl}/${userId}/assignments`);
  }

  assignCourse(userId: number, courseId: number): Observable<CourseAssignment> {
    const request: CourseAssignmentRequest = { courseId };
    return this.http.post<CourseAssignment>(`${this.apiUrl}/${userId}/assignments`, request);
  }
}
