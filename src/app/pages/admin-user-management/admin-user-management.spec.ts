import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, Subject, throwError } from 'rxjs';
import { AppUser, CourseAssignment, CourseManagementResponse } from '../../models/app.models';
import { AdminUserService } from '../../services/admin-user';
import { CourseManagementService } from '../../services/course-management';
import { AdminUserManagementComponent } from './admin-user-management';

describe('AdminUserManagementComponent', () => {
  function create(
    usersResponse: Observable<AppUser[]> = of(users),
    coursesResponse: Observable<CourseManagementResponse[]> = of(courses),
    assignmentsResponse: Observable<CourseAssignment[]> = of([]),
  ) {
    const adminService = {
      getUsers: vi.fn(() => usersResponse),
      getAssignments: vi.fn(() => assignmentsResponse),
      assignCourse: vi.fn(() => of(assignment)),
    };
    const courseService = { getCourses: vi.fn(() => coursesResponse) };
    const snackBar: Pick<MatSnackBar, 'open'> = { open: vi.fn() };
    TestBed.configureTestingModule({
      imports: [AdminUserManagementComponent],
      providers: [
        { provide: AdminUserService, useValue: adminService },
        { provide: CourseManagementService, useValue: courseService },
      ],
    });
    TestBed.overrideProvider(MatSnackBar, { useValue: snackBar });
    const fixture = TestBed.createComponent(AdminUserManagementComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component, adminService, courseService, snackBar };
  }

  it('loads and renders users', () => {
    const { fixture, component, adminService, courseService } = create();
    expect(adminService.getUsers).toHaveBeenCalledOnce();
    expect(courseService.getCourses).toHaveBeenCalledOnce();
    expect(component.users()).toEqual(users);
    expect(fixture.nativeElement.textContent).toContain('Learner One');
    expect(fixture.nativeElement.textContent).toContain('learner@example.com');
  });

  it('loads assignments when a user is selected', () => {
    const { component, adminService } = create(of(users), of(courses), of([assignment]));
    component.selectUser(users[0]);
    expect(adminService.getAssignments).toHaveBeenCalledWith(users[0].id);
    expect(component.assignments()).toEqual([assignment]);
  });

  it('renders the assignment loading state while the request is unresolved', () => {
    const response = new Subject<CourseAssignment[]>();
    const { fixture, component } = create(of(users), of(courses), response);

    component.selectUser(users[0]);
    fixture.detectChanges();

    expect(component.assignmentsLoading()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Loading assignments');
    expect(fixture.nativeElement.querySelector('.assignments-panel mat-spinner')).not.toBeNull();

    response.next([]);
    response.complete();
    fixture.detectChanges();

    expect(component.assignmentsLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('No courses assigned');
  });

  it('shows the empty assignment state', () => {
    const { fixture, component } = create();
    component.selectUser(users[0]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No courses assigned');
  });

  it('updates assignments and removes the assigned course from available choices', () => {
    const { component, adminService, snackBar } = create();
    component.selectUser(users[0]);
    component.selectedCourseId.set(7);
    component.assignCourse();
    expect(adminService.assignCourse).toHaveBeenCalledWith(users[0].id, 7);
    expect(component.assignments()).toEqual([assignment]);
    expect(component.availableCourses()).toEqual([courses[1]]);
    expect(component.selectedCourseId()).toBeNull();
    expect(snackBar.open).toHaveBeenCalledWith('Course assigned successfully.', 'Dismiss', {
      duration: 3500,
    });
  });

  it('does not submit a course that is no longer available', () => {
    const { component, adminService } = create(of(users), of(courses), of([assignment]));
    component.selectUser(users[0]);
    component.selectedCourseId.set(assignment.course.id);

    component.assignCourse();

    expect(adminService.assignCourse).not.toHaveBeenCalled();
  });

  it('shows the safe duplicate message for a 409 response', () => {
    const { component, adminService } = create();
    adminService.assignCourse.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { message: 'raw database constraint details' },
          }),
      ),
    );
    component.selectUser(users[0]);
    component.selectedCourseId.set(7);
    component.assignCourse();
    expect(component.actionError()).toBe('This course is already assigned to the selected user.');
    expect(component.actionError()).not.toContain('constraint');
  });

  it('disables assignment while pending and prevents repeated submissions', () => {
    const pending = new Subject<CourseAssignment>();
    const { fixture, component, adminService } = create();
    adminService.assignCourse.mockReturnValue(pending);
    component.selectUser(users[0]);
    component.selectedCourseId.set(7);

    component.assignCourse();
    component.assignCourse();
    fixture.detectChanges();

    expect(component.assignmentPending()).toBe(true);
    expect(adminService.assignCourse).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelector('.assign-button').disabled).toBe(true);
  });

  it('uses safe messages without exposing raw backend errors', () => {
    const response = throwError(
      () => new HttpErrorResponse({ status: 500, error: 'sensitive server stack trace' }),
    );
    const { fixture, component } = create(of(users), of(courses), response);
    component.selectUser(users[0]);
    fixture.detectChanges();
    expect(component.assignmentsError()).toBe(
      'Unable to load course assignments. Please try again.',
    );
    expect(fixture.nativeElement.textContent).not.toContain('sensitive server stack trace');
  });
});

const users: AppUser[] = [
  { id: 4, name: 'Learner One', email: 'learner@example.com', role: 'USER' },
];
const courses: CourseManagementResponse[] = [
  {
    id: 7,
    title: 'Angular Basics',
    description: 'Learn Angular',
    instructor: 'Ada',
    duration: 8,
    level: 'BEGINNER',
    category: 'INFORMATION_TECHNOLOGY',
  },
  {
    id: 8,
    title: 'Spring Basics',
    description: 'Learn Spring',
    instructor: 'Grace',
    duration: 10,
    level: 'BEGINNER',
    category: 'INFORMATION_TECHNOLOGY',
  },
];
const assignment: CourseAssignment = {
  id: 10,
  course: courses[0],
  assignedAt: '2026-08-31T10:00:00Z',
};
