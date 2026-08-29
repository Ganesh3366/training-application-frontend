import { HttpErrorResponse } from '@angular/common/http';
import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import { AppUser, Course, CourseModule, CourseProgress } from '../../models/app.models';
import { AuthService } from '../../services/auth';
import { CourseService } from '../../services/course';
import { CourseDetails } from './course-details';

describe('CourseDetails', () => {
  function setup(
    courseResponse: Observable<Course> = of(course),
    moduleResponse: Observable<CourseModule[]> = of(modules),
    currentUser = signal<AppUser | null>(null),
    authResolved = signal(true),
    progressResponse: Observable<CourseProgress> = of(progress),
  ) {
    const getCourseProgress = vi.fn(() => progressResponse);
    TestBed.configureTestingModule({
      imports: [CourseDetails],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '3' }) } } },
        {
          provide: CourseService,
          useValue: { getCourseById: () => courseResponse, getModules: () => moduleResponse, getCourseProgress },
        },
        {
          provide: AuthService,
          useValue: { currentUser, authResolved, isLoggedIn: computed(() => currentUser() !== null) },
        },
      ],
    });
    const fixture = TestBed.createComponent(CourseDetails);
    fixture.detectChanges();
    return { fixture, getCourseProgress, currentUser, authResolved };
  }

  function create(courseResponse: Observable<Course>, moduleResponse: Observable<CourseModule[]>): ComponentFixture<CourseDetails> {
    return setup(courseResponse, moduleResponse).fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('displays the real course and module summaries', () => {
    const modules: CourseModule[] = [{ id: 9, title: 'HTTP Basics', description: 'Requests and responses', position: 1 }];
    const text = create(of(course), of(modules)).nativeElement.textContent;
    expect(text).toContain('Backend Integration');
    expect(text).toContain('HTTP Basics');
    expect(text).toContain('Requests and responses');
  });

  it('links Start Learning and each module using the course and module ids', () => {
    const modules: CourseModule[] = [
      { id: 9, title: 'HTTP Basics', description: null, position: 1 },
      { id: 12, title: 'HTTP Advanced', description: null, position: 2 },
    ];
    const fixture = create(of(course), of(modules));
    const links = [...fixture.nativeElement.querySelectorAll('a')] as HTMLAnchorElement[];
    expect(links.find((link) => link.textContent?.includes('Start Learning'))?.getAttribute('href'))
      .toBe('/courses/3/modules/9');
    expect(links.filter((link) => link.textContent?.includes('Open Module')).map((link) => link.getAttribute('href')))
      .toEqual(['/courses/3/modules/9', '/courses/3/modules/12']);
  });

  it('displays not found for a 404', () => {
    const error = new HttpErrorResponse({ status: 404 });
    expect(create(throwError(() => error), of([])).nativeElement.textContent).toContain('Course not found.');
  });

  it('displays a safe general API error', () => {
    const error = new HttpErrorResponse({ status: 500 });
    expect(create(throwError(() => error), of([])).nativeElement.textContent).toContain('Unable to load course.');
  });

  it('keeps course and modules visible and does not load progress while logged out', () => {
    const { fixture, getCourseProgress } = setup();
    expect(fixture.nativeElement.textContent).toContain('Backend Integration');
    expect(fixture.nativeElement.textContent).toContain('First Module');
    expect(fixture.nativeElement.textContent).not.toContain('Course Progress');
    expect(getCourseProgress).not.toHaveBeenCalled();
  });

  it('does not load or flash progress while auth restoration is pending', () => {
    const { fixture, getCourseProgress } = setup(of(course), of(modules), signal(null), signal(false));
    expect(fixture.nativeElement.textContent).not.toContain('Course Progress');
    expect(getCourseProgress).not.toHaveBeenCalled();
  });

  it('loads progress once for an authenticated user and renders summary and module statuses by id', () => {
    const userSignal = signal<AppUser | null>(user);
    const { fixture, getCourseProgress } = setup(of(course), of(modules), userSignal);
    fixture.detectChanges();
    expect(getCourseProgress).toHaveBeenCalledTimes(1);
    expect(getCourseProgress).toHaveBeenCalledWith(3);
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('1 of 2 modules completed');
    const items = [...fixture.nativeElement.querySelectorAll('.module-list li')] as HTMLElement[];
    expect(items[0].textContent).toContain('Pending');
    expect(items[0].querySelector('.status-badge')?.classList).toContain('status-pending');
    expect(items[1].textContent).toContain('Completed');
    expect(items[1].querySelector('.status-badge')?.classList).toContain('status-completed');
  });

  it('loads on login, clears on logout, and fetches fresh progress on re-login', () => {
    const currentUser = signal<AppUser | null>(null);
    const { fixture, getCourseProgress } = setup(of(course), of(modules), currentUser);
    currentUser.set(user);
    fixture.detectChanges();
    expect(getCourseProgress).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.progress()).toEqual(progress);

    currentUser.set(null);
    fixture.detectChanges();
    expect(fixture.componentInstance.progress()).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Course Progress');

    currentUser.set({ ...user });
    fixture.detectChanges();
    expect(getCourseProgress).toHaveBeenCalledTimes(2);
  });

  it('ignores a stale progress response received after logout', () => {
    const currentUser = signal<AppUser | null>(user);
    const response = new Subject<CourseProgress>();
    const { fixture } = setup(of(course), of(modules), currentUser, signal(true), response);
    currentUser.set(null);
    fixture.detectChanges();
    response.next(progress);
    expect(fixture.componentInstance.progress()).toBeNull();
  });

  it('shows a non-blocking progress error while preserving course content', () => {
    const currentUser = signal<AppUser | null>(user);
    const { fixture } = setup(
      of(course), of(modules), currentUser, signal(true), throwError(() => new HttpErrorResponse({ status: 500 })),
    );
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Unable to load progress.');
    expect(text).toContain('Backend Integration');
    expect(text).toContain('First Module');
  });
});

const course: Course = {
  id: 3, title: 'Backend Integration', description: 'Use APIs', instructor: 'Grace', duration: 6,
  level: 'Intermediate', category: 'Information Technology (IT)',
};

const user: AppUser = { id: 5, name: 'Learner', email: 'learner@example.com', role: 'USER' };

const modules: CourseModule[] = [
  { id: 9, title: 'First Module', description: null, position: 1 },
  { id: 12, title: 'Second Module', description: null, position: 2 },
];

const progress: CourseProgress = {
  courseId: 3,
  totalModules: 2,
  completedModules: 1,
  pendingModules: 1,
  modules: [
    { moduleId: 12, completed: true, attemptsCount: 1, lastScore: 90, bestScore: 90, completedAt: '2026-08-29T10:00:00Z' },
    { moduleId: 9, completed: false, attemptsCount: 0, lastScore: null, bestScore: null, completedAt: null },
  ],
};
