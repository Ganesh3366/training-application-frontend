import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LearnerCourseReport } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class LearnerProgressReportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/management/reports/learner-courses';

  getReports(): Observable<LearnerCourseReport[]> {
    return this.http.get<LearnerCourseReport[]>(this.apiUrl);
  }
}
