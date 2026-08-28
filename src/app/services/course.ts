import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Course, CourseModule } from '../models/app.models';

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
}
