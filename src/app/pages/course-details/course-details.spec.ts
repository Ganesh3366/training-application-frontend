import { HttpErrorResponse } from '@angular/common/http';
import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { AppUser, Course, CourseModule, CourseProgress } from '../../models/app.models';
import { AuthService } from '../../services/auth';
import { CourseService } from '../../services/course';
import { AuthDialog } from '../../shared/auth-dialog/auth-dialog';
import { CourseDetails } from './course-details';

describe('CourseDetails', () => {
  function setup(
    courseResponse: Observable<Course> = of(course),
    moduleResponse: Observable<CourseModule[]> = of(modules),
    currentUser = signal<AppUser | null>(null),
    authResolved = signal(true),
    progressResponse: Observable<CourseProgress> = of(progress),
    queryParams: Record<string, string> = {},
    dialogClosed: Observable<void> = of(undefined),
  ) {
    const getCourseProgress = vi.fn(() => progressResponse);
    const queryParamMap = new BehaviorSubject(convertToParamMap(queryParams));
    const route = {
      snapshot: {
        paramMap: convertToParamMap({ id: '3' }),
      },
      queryParamMap: queryParamMap.asObservable(),
    };
    const open = vi.fn(() => ({ afterClosed: () => dialogClosed }));
    TestBed.configureTestingModule({
      imports: [CourseDetails],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: route },
        { provide: MatDialog, useValue: { open } },
        {
          provide: CourseService,
          useValue: {
            getCourseById: () => courseResponse,
            getModules: () => moduleResponse,
            getCourseProgress,
          },
        },
        {
          provide: AuthService,
          useValue: {
            currentUser,
            authResolved,
            isLoggedIn: computed(() => currentUser() !== null),
          },
        },
      ],
    });
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(CourseDetails);
    fixture.detectChanges();
    return {
      fixture,
      getCourseProgress,
      currentUser,
      authResolved,
      navigate,
      navigateByUrl,
      open,
      route,
      queryParamMap,
    };
  }

  function create(
    courseResponse: Observable<Course>,
    moduleResponse: Observable<CourseModule[]>,
  ): ComponentFixture<CourseDetails> {
    return setup(courseResponse, moduleResponse).fixture;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('displays the real course and module summaries', () => {
    const modules: CourseModule[] = [
      { id: 9, title: 'HTTP Basics', description: 'Requests and responses', position: 1 },
    ];
    const text = create(of(course), of(modules)).nativeElement.textContent;
    expect(text).toContain('Backend Integration');
    expect(text).toContain('HTTP Basics');
    expect(text).toContain('Requests and responses');
  });

  it('links back to the Courses page', () => {
    const fixture = create(of(course), of(modules));
    const link = fixture.nativeElement.querySelector('app-back-navigation a') as HTMLAnchorElement;

    expect(link.textContent).toContain('Back to Courses');
    expect(link.getAttribute('href')).toBe('/courses');
  });

  it('links Start Learning and each module using the course and module ids', () => {
    const modules: CourseModule[] = [
      { id: 9, title: 'HTTP Basics', description: null, position: 1 },
      { id: 12, title: 'HTTP Advanced', description: null, position: 2 },
    ];
    const fixture = create(of(course), of(modules));
    const links = [...fixture.nativeElement.querySelectorAll('a')] as HTMLAnchorElement[];
    expect(
      links.find((link) => link.textContent?.includes('Start Learning'))?.getAttribute('href'),
    ).toBe('/courses/3/modules/9');
    expect(
      links
        .filter((link) => link.textContent?.includes('Open Module'))
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/courses/3/modules/9', '/courses/3/modules/12']);
  });

  it('displays not found for a 404', () => {
    const error = new HttpErrorResponse({ status: 404 });
    expect(
      create(
        throwError(() => error),
        of([]),
      ).nativeElement.textContent,
    ).toContain('Course not found.');
  });

  it('displays a safe general API error', () => {
    const error = new HttpErrorResponse({ status: 500 });
    expect(
      create(
        throwError(() => error),
        of([]),
      ).nativeElement.textContent,
    ).toContain('Unable to load course.');
  });

  it('keeps course and modules visible and does not load progress while logged out', () => {
    const { fixture, getCourseProgress } = setup();
    expect(fixture.nativeElement.textContent).toContain('Backend Integration');
    expect(fixture.nativeElement.textContent).toContain('First Module');
    expect(fixture.nativeElement.textContent).not.toContain('Course Progress');
    expect(getCourseProgress).not.toHaveBeenCalled();
  });

  it('does not load or flash progress while auth restoration is pending', () => {
    const { fixture, getCourseProgress } = setup(
      of(course),
      of(modules),
      signal(null),
      signal(false),
    );
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
      of(course),
      of(modules),
      currentUser,
      signal(true),
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Unable to load progress.');
    expect(text).toContain('Backend Integration');
    expect(text).toContain('First Module');
  });

  it('shows the certificate link when every non-zero module is completed', () => {
    const currentUser = signal<AppUser | null>(user);
    const { fixture } = setup(
      of(course),
      of(modules),
      currentUser,
      signal(true),
      of(completedProgress),
    );
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('.certificate-link') as HTMLAnchorElement;
    expect(link?.textContent).toContain('View Certificate');
    expect(link?.getAttribute('href')).toBe('/courses/3/certificate');
  });

  it('hides the certificate link while modules remain incomplete', () => {
    const currentUser = signal<AppUser | null>(user);
    const { fixture } = setup(of(course), of(modules), currentUser, signal(true), of(progress));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.certificate-link')).toBeNull();
  });

  it('hides the certificate link for a zero-module course', () => {
    const currentUser = signal<AppUser | null>(user);
    const zeroModuleProgress: CourseProgress = {
      courseId: 3,
      totalModules: 0,
      completedModules: 0,
      pendingModules: 0,
      progressPercentage: 0,
      completed: false,
      status: 'NOT_STARTED',
      modules: [],
    };
    const { fixture } = setup(
      of(course),
      of([]),
      currentUser,
      signal(true),
      of(zeroModuleProgress),
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.certificate-link')).toBeNull();
  });

  it('hides the certificate link from anonymous users', () => {
    const { fixture, getCourseProgress } = setup();
    expect(fixture.nativeElement.querySelector('.certificate-link')).toBeNull();
    expect(getCourseProgress).not.toHaveBeenCalled();
  });

  it('prevents a second dialog while open and allows a new trigger after it closes', () => {
    const closed = new Subject<void>();
    const { fixture, navigate, open, route, queryParamMap } = setup(
      of(course),
      of(modules),
      signal(null),
      signal(true),
      of(progress),
      {},
      closed,
    );

    expect(open).not.toHaveBeenCalled();

    const loginTrigger = convertToParamMap({
      login: 'required',
      returnUrl: '/courses/3/modules/9',
    });
    queryParamMap.next(loginTrigger);

    expect(open).toHaveBeenCalledOnce();
    expect(open).toHaveBeenCalledWith(
      AuthDialog,
      expect.objectContaining({
        data: { mode: 'login' },
        width: '480px',
        maxWidth: 'calc(100vw - 32px)',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      }),
    );
    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { login: null, returnUrl: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    queryParamMap.next(convertToParamMap({}));
    queryParamMap.next(loginTrigger);
    expect(open).toHaveBeenCalledOnce();

    queryParamMap.next(convertToParamMap({}));
    closed.next();
    closed.complete();

    queryParamMap.next(loginTrigger);
    fixture.detectChanges();
    expect(open).toHaveBeenCalledTimes(2);
  });

  it('stays on the public course page when the dialog closes without login', () => {
    const closed = new Subject<void>();
    const { fixture, navigateByUrl, open } = setup(
      of(course),
      of(modules),
      signal(null),
      signal(true),
      of(progress),
      { login: 'required', returnUrl: '/courses/3/modules/9' },
      closed,
    );

    closed.next();
    closed.complete();
    fixture.detectChanges();

    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.textContent).toContain('Backend Integration');
  });

  it('navigates to a valid local return URL after successful login and dialog close', () => {
    const closed = new Subject<void>();
    const currentUser = signal<AppUser | null>(null);
    const { navigateByUrl } = setup(
      of(course),
      of(modules),
      currentUser,
      signal(true),
      of(progress),
      { login: 'required', returnUrl: '/courses/47/modules/812' },
      closed,
    );

    currentUser.set(user);
    closed.next();
    closed.complete();

    expect(navigateByUrl).toHaveBeenCalledOnce();
    expect(navigateByUrl).toHaveBeenCalledWith('/courses/47/modules/812');
  });

  it.each(['https://evil.example', '//evil.example', 'javascript:alert(1)'])(
    'ignores unsafe return URL %s',
    (returnUrl) => {
      const closed = new Subject<void>();
      const currentUser = signal<AppUser | null>(null);
      const { navigateByUrl, open } = setup(
        of(course),
        of(modules),
        currentUser,
        signal(true),
        of(progress),
        { login: 'required', returnUrl },
        closed,
      );

      currentUser.set(user);
      closed.next();
      closed.complete();

      expect(open).toHaveBeenCalledOnce();
      expect(navigateByUrl).not.toHaveBeenCalled();
    },
  );
});

const course: Course = {
  id: 3,
  title: 'Backend Integration',
  description: 'Use APIs',
  instructor: 'Grace',
  duration: 6,
  level: 'Intermediate',
  category: 'Information Technology (IT)',
};

const user: AppUser = {
  id: 5,
  name: 'Learner',
  email: 'learner@example.com',
  role: 'USER',
  enabled: true,
};

const modules: CourseModule[] = [
  { id: 9, title: 'First Module', description: null, position: 1 },
  { id: 12, title: 'Second Module', description: null, position: 2 },
];

const progress: CourseProgress = {
  courseId: 3,
  totalModules: 2,
  completedModules: 1,
  pendingModules: 1,
  progressPercentage: 50,
  completed: false,
  status: 'IN_PROGRESS',
  modules: [
    {
      moduleId: 12,
      completed: true,
      attemptsCount: 1,
      lastScore: 90,
      bestScore: 90,
      completedAt: '2026-08-29T10:00:00Z',
    },
    {
      moduleId: 9,
      completed: false,
      attemptsCount: 0,
      lastScore: null,
      bestScore: null,
      completedAt: null,
    },
  ],
};

const completedProgress: CourseProgress = {
  courseId: 3,
  totalModules: 2,
  completedModules: 2,
  pendingModules: 0,
  progressPercentage: 100,
  completed: true,
  status: 'COMPLETED',
  modules: [
    {
      moduleId: 9,
      completed: true,
      attemptsCount: 1,
      lastScore: 90,
      bestScore: 90,
      completedAt: '2026-08-29T10:00:00Z',
    },
    {
      moduleId: 12,
      completed: true,
      attemptsCount: 1,
      lastScore: 95,
      bestScore: 95,
      completedAt: '2026-08-29T10:10:00Z',
    },
  ],
};
