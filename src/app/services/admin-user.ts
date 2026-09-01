import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AdminUserCreateRequest,
  AdminUserEnabledRequest,
  AdminUserUpdateRequest,
  AppUser,
  CourseAssignment,
  CourseAssignmentRequest,
} from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/admin/users';

  getUsers(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.apiUrl);
  }

  createUser(request: AdminUserCreateRequest): Observable<AppUser> {
    return this.http.post<AppUser>(this.apiUrl, request);
  }

  updateUser(userId: number, request: AdminUserUpdateRequest): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.apiUrl}/${userId}`, request);
  }

  setUserEnabled(userId: number, enabled: boolean): Observable<AppUser> {
    const request: AdminUserEnabledRequest = { enabled };
    return this.http.patch<AppUser>(`${this.apiUrl}/${userId}/enabled`, request);
  }

  getAssignments(userId: number): Observable<CourseAssignment[]> {
    return this.http.get<CourseAssignment[]>(`${this.apiUrl}/${userId}/assignments`);
  }

  assignCourse(userId: number, courseId: number): Observable<CourseAssignment> {
    const request: CourseAssignmentRequest = { courseId };
    return this.http.post<CourseAssignment>(`${this.apiUrl}/${userId}/assignments`, request);
  }
}
