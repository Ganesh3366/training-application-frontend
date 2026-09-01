import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { LearnerCourseReport } from '../../models/app.models';
import { LearnerProgressReportService } from '../../services/learner-progress-report';
import { LearnerProgressReportComponent } from './learner-progress-report';

describe('LearnerProgressReportComponent', () => {
  function create(reports: Observable<LearnerCourseReport[]> = of([report])): {
    fixture: ComponentFixture<LearnerProgressReportComponent>;
    service: { getReports: ReturnType<typeof vi.fn> };
  } {
    const service = { getReports: vi.fn(() => reports) };
    TestBed.configureTestingModule({
      imports: [LearnerProgressReportComponent],
      providers: [{ provide: LearnerProgressReportService, useValue: service }],
    });
    const fixture = TestBed.createComponent(LearnerProgressReportComponent);
    fixture.detectChanges();
    return { fixture, service };
  }

  it('shows a loading state while reports are being requested', () => {
    const response = new Subject<LearnerCourseReport[]>();
    const { fixture } = create(response);

    expect(fixture.nativeElement.textContent).toContain('Loading learner progress');

    response.next([report]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ada Learner');
  });

  it('shows a safe error state', () => {
    const { fixture } = create(throwError(() => new HttpErrorResponse({ status: 500 })));

    expect(fixture.nativeElement.textContent).toContain('Reports could not be loaded');
    expect(fixture.nativeElement.textContent).toContain(
      'Unable to load learner progress reports. Please try again.',
    );
    expect(fixture.nativeElement.textContent).not.toContain('HttpErrorResponse');
  });

  it('shows an empty state when no assignments are reported', () => {
    const { fixture } = create(of([]));

    expect(fixture.nativeElement.textContent).toContain('No learner progress yet');
    expect(fixture.nativeElement.textContent).toContain(
      'Reports will appear here when learners have assigned courses.',
    );
  });

  it('renders learner, course, progress counts, and a friendly status', () => {
    const { fixture } = create();
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Ada Learner');
    expect(text).toContain('ada@example.com');
    expect(text).toContain('Angular Essentials');
    expect(text).toContain('50%');
    expect(text).toContain('1 / 2');
    expect(text).toContain('Pending modules');
    expect(text).toContain('In Progress');
    expect(
      fixture.nativeElement.querySelector('mat-progress-bar')?.getAttribute('aria-valuenow'),
    ).toBe('50');
  });

  it('renders expandable module quiz aggregates and completion state', () => {
    const { fixture } = create();
    const details = fixture.nativeElement.querySelector('details') as HTMLDetailsElement;
    details.open = true;
    fixture.detectChanges();
    const text = details.textContent;

    expect(text).toContain('Module details');
    expect(text).toContain('Components');
    expect(text).toContain('Completed');
    expect(text).toContain('72%');
    expect(text).toContain('88%');
    expect(text).toContain('3');
    expect(details.querySelector('time[datetime="2026-01-02T10:00:00Z"]')).not.toBeNull();
  });

  it('renders friendly values for missing scores and completion data', () => {
    const { fixture } = create();
    const text = fixture.nativeElement.textContent;

    expect(text.match(/Not attempted/g)).toHaveLength(2);
    expect(text).toContain('Not completed');
    expect(text).toContain('Not issued');
  });

  it('renders certificate and course completion information when present', () => {
    const completed = {
      ...report,
      status: 'COMPLETED' as const,
      progressPercentage: 100,
      completedModules: 2,
      pendingModules: 0,
      completionDate: '2026-01-02',
      certificateNumber: 'SF-2026-001',
    };
    const { fixture } = create(of([completed]));

    expect(fixture.nativeElement.textContent).toContain('Completed');
    expect(fixture.nativeElement.textContent).toContain('SF-2026-001');
    expect(fixture.nativeElement.querySelector('time[datetime="2026-01-02"]')).not.toBeNull();
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
  modules: [
    {
      moduleId: 10,
      moduleTitle: 'Components',
      completed: true,
      lastScore: 72,
      bestScore: 88,
      attemptCount: 3,
      completedAt: '2026-01-02T10:00:00Z',
    },
    {
      moduleId: 11,
      moduleTitle: 'Routing',
      completed: false,
      lastScore: null,
      bestScore: null,
      attemptCount: 0,
      completedAt: null,
    },
  ],
};
