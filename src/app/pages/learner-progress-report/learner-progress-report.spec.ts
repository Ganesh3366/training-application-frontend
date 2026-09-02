import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { LearnerCourseReport } from '../../models/app.models';
import { LearnerProgressReportService } from '../../services/learner-progress-report';
import { LearnerProgressReportComponent } from './learner-progress-report';

describe('LearnerProgressReportComponent', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function create(
    reports: Observable<LearnerCourseReport[]> = of([report]),
    getReports = vi.fn(() => reports),
  ): {
    fixture: ComponentFixture<LearnerProgressReportComponent>;
    service: { getReports: ReturnType<typeof vi.fn> };
  } {
    const service = { getReports };
    TestBed.configureTestingModule({
      imports: [LearnerProgressReportComponent],
      providers: [{ provide: LearnerProgressReportService, useValue: service }],
    });
    const fixture = TestBed.createComponent(LearnerProgressReportComponent);
    fixture.detectChanges();
    return { fixture, service };
  }

  it('fetches reports on initial page load', () => {
    const { service } = create();

    expect(service.getReports).toHaveBeenCalledTimes(1);
  });

  it('groups multiple course reports under one learner expansion panel', () => {
    const secondCourse = { ...report, courseId: 4, courseTitle: 'TypeScript Essentials' };
    const { fixture } = create(of([report, secondCourse]));

    const panels = fixture.nativeElement.querySelectorAll('.learner-panel');
    expect(panels).toHaveLength(1);
    expect(panels[0].textContent).toContain('Ada Learner');
    expect(panels[0].textContent).toContain('2 courses');
    expect(panels[0].textContent).toContain('Angular Essentials');
    expect(panels[0].textContent).toContain('TypeScript Essentials');
  });

  it('renders separate learner expansion panels for different learner IDs', () => {
    const differentLearner = {
      ...report,
      learnerId: 99,
      learnerName: 'Grace Learner',
      learnerEmail: 'grace@example.com',
      courseId: 11,
      courseTitle: 'DevOps Fundamentals',
    };
    const { fixture } = create(of([report, differentLearner]));

    const panels = fixture.nativeElement.querySelectorAll('.learner-panel');
    expect(panels).toHaveLength(2);
    expect(panels[0].textContent).toContain('Ada Learner');
    expect(panels[1].textContent).toContain('Grace Learner');
  });

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

  it('shows an empty state when no learner-course reports are returned', () => {
    const { fixture } = create(of([]));

    expect(fixture.nativeElement.textContent).toContain('No learner progress yet');
    expect(fixture.nativeElement.textContent).toContain(
      'Reports will appear when learners have course assignments or learning activity.',
    );
  });

  it('renders an assigned row with its assignment timestamp in two separate items', () => {
    const { fixture } = create();
    const items = fixture.nativeElement.querySelectorAll('.assignment-item');

    expect(items).toHaveLength(2);
    expect(items[0].querySelector('.assignment-badge.assigned')).not.toBeNull();
    expect(items[0].textContent).toContain('Assignment Status');
    expect(items[0].textContent).toContain('Assigned');
    expect(items[1].textContent).toContain('Assigned On');
    expect(items[1].querySelector('time')?.getAttribute('datetime')).toBe('2025-12-01T10:00:00Z');
    expect(items[1].textContent).toContain('Dec 1, 2025');
  });

  it('renders activity-only rows as not assigned and does not render a separate Assigned On item', () => {
    const activityOnly = {
      ...report,
      assigned: false,
      assignedAt: '2026-02-03T10:00:00Z',
    };
    const { fixture } = create(of([activityOnly]));
    const items = fixture.nativeElement.querySelectorAll('.assignment-item');

    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain('Assignment Status');
    expect(items[0].textContent).toContain('Learning activity without assignment');
    expect(items[0].querySelector('.assignment-badge.activity-only')).not.toBeNull();
    expect(items[0].querySelector('time')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Ada Learner');
    expect(fixture.nativeElement.textContent).toContain('50%');
  });

  it('counts only rows explicitly marked as assigned', () => {
    const activityOnly = {
      ...report,
      courseId: 4,
      courseTitle: 'TypeScript Essentials',
      assigned: false,
      assignedAt: null,
    };
    const { fixture } = create(of([report, activityOnly]));
    const heading = fixture.nativeElement.querySelector('.section-heading p').textContent;

    expect(heading).toMatch(/2 reports\s*·\s*1 assignment/);
    expect(heading).not.toContain('2 assignments');
    expect(fixture.nativeElement.querySelectorAll('.report-card')).toHaveLength(2);
  });

  it('renders learner, course, progress counts, and a friendly status', () => {
    const { fixture } = create();
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Ada Learner');
    expect(text).toContain('ada@example.com');
    expect(text).toContain('Angular Essentials');
    expect(text).toContain('50%');
    expect(text).toContain('1 of 2');
    expect(text).toContain('Pending modules');
    expect(text).toContain('In Progress');
    expect(
      fixture.nativeElement.querySelector('mat-progress-bar')?.getAttribute('aria-valuenow'),
    ).toBe('50');
  });

  it('renders learner name in Title Case from lowercase original data', () => {
    const lowerCaseReport = {
      ...report,
      learnerName: 'ada learner',
    };
    const { fixture } = create(of([lowerCaseReport]));

    const panelTitle = fixture.nativeElement.querySelector('.learner-name');
    expect(panelTitle.textContent).toContain('Ada Learner');
    expect(fixture.componentInstance.reports()[0].learnerName).toBe('ada learner');
  });

  it('displays "Assignment Status" label and not "Assignment state"', () => {
    const { fixture } = create();
    const assignmentItem = fixture.nativeElement.querySelector('.assignment-item');

    expect(assignmentItem.textContent).toContain('Assignment Status');
    expect(assignmentItem.textContent).not.toContain('Assignment state');
  });

  it('displays assigned date with "Assigned On" label in a separate item when present', () => {
    const { fixture } = create();
    const items = fixture.nativeElement.querySelectorAll('.assignment-item');

    expect(items).toHaveLength(2);
    expect(items[1].textContent).toContain('Assigned On');
    const time = items[1].querySelector('time[datetime="2025-12-01T10:00:00Z"]');
    expect(time).not.toBeNull();
    expect(items[1].textContent).toContain('Dec 1, 2025');
  });

  it('displays Completed Modules in "X of Y" format', () => {
    const { fixture } = create();
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Completed modules');
    expect(text).toContain('1 of 2');
    expect(text).not.toContain('1 / 2');
  });

  it('renders expansion affordance chevron on learner panel', () => {
    const { fixture } = create();
    const panel = fixture.nativeElement.querySelector('.learner-panel');
    const header = panel.querySelector('.mat-expansion-panel-header');

    expect(header).not.toBeNull();
    expect(panel.getAttribute('hideToggle')).toBeNull();
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

  it('refreshes reports automatically after 15 seconds', () => {
    vi.useFakeTimers();
    const { fixture, service } = create();

    vi.advanceTimersByTime(15_000);

    expect(service.getReports).toHaveBeenCalledTimes(2);
    fixture.destroy();
  });

  it('stops automatic and active-window refreshes after cleanup', () => {
    vi.useFakeTimers();
    const { fixture, service } = create();

    fixture.destroy();
    vi.advanceTimersByTime(30_000);
    window.dispatchEvent(new Event('focus'));

    expect(service.getReports).toHaveBeenCalledTimes(1);
  });

  it('keeps existing reports visible during a background refresh', () => {
    vi.useFakeTimers();
    const backgroundResponse = new Subject<LearnerCourseReport[]>();
    const getReports = vi
      .fn<() => Observable<LearnerCourseReport[]>>()
      .mockReturnValueOnce(of([report]))
      .mockReturnValueOnce(backgroundResponse);
    const { fixture, service } = create(of([report]), getReports);
    const details = fixture.nativeElement.querySelector('details') as HTMLDetailsElement;
    details.open = true;

    vi.advanceTimersByTime(15_000);
    fixture.detectChanges();

    expect(service.getReports).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Ada Learner');
    expect(fixture.nativeElement.textContent).not.toContain('Loading learner progress');

    backgroundResponse.next([{ ...report, progressPercentage: 75 }]);
    backgroundResponse.complete();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('75%');
    expect(details.open).toBe(true);
    fixture.destroy();
  });

  it('refreshes reports when the page becomes active again', () => {
    const { fixture, service } = create();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');

    document.dispatchEvent(new Event('visibilitychange'));

    expect(service.getReports).toHaveBeenCalledTimes(2);
    fixture.destroy();
  });

  it('does not overlap refresh requests', () => {
    vi.useFakeTimers();
    const response = new Subject<LearnerCourseReport[]>();
    const { fixture, service } = create(response);

    vi.advanceTimersByTime(15_000);
    window.dispatchEvent(new Event('focus'));

    expect(service.getReports).toHaveBeenCalledTimes(1);
    response.next([report]);
    response.complete();
    fixture.destroy();
  });
});

const report: LearnerCourseReport = {
  learnerId: 7,
  learnerName: 'Ada Learner',
  learnerEmail: 'ada@example.com',
  courseId: 3,
  courseTitle: 'Angular Essentials',
  assigned: true,
  assignedAt: '2025-12-01T10:00:00Z',
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
