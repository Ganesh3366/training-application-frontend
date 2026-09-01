import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LearnerCourseReport } from '../models/app.models';
import { LearnerProgressReportService } from './learner-progress-report';

describe('LearnerProgressReportService', () => {
  let service: LearnerProgressReportService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LearnerProgressReportService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads learner-course reports from the read-only management endpoint', () => {
    service.getReports().subscribe((reports) => expect(reports).toEqual([report]));

    const request = http.expectOne('/api/management/reports/learner-courses');
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeNull();
    request.flush([report]);
  });
});

const report: LearnerCourseReport = {
  learnerId: 7,
  learnerName: 'Ada Learner',
  learnerEmail: 'ada@example.com',
  courseId: 3,
  courseTitle: 'Angular Essentials',
  completedModules: 1,
  totalModules: 2,
  pendingModules: 1,
  progressPercentage: 50,
  status: 'IN_PROGRESS',
  completionDate: null,
  certificateNumber: null,
  modules: [],
};
