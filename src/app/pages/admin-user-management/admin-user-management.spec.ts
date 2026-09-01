import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { defer, Observable, of, Subject, throwError } from 'rxjs';
import { AppUser, CourseAssignment, CourseManagementResponse, Role } from '../../models/app.models';
import { AdminUserService } from '../../services/admin-user';
import { AuthService } from '../../services/auth';
import { CourseManagementService } from '../../services/course-management';
import { AdminUserManagementComponent } from './admin-user-management';
import { AdminUserFormComponent } from './user-form/user-form';

describe('AdminUserManagementComponent', () => {
  function create(
    usersResponse: Observable<AppUser[]> = of(users),
    coursesResponse: Observable<CourseManagementResponse[]> = of(courses),
    assignmentsResponse: Observable<CourseAssignment[]> = of([]),
    role: Role | null = 'ADMIN',
  ) {
    const adminService = {
      getUsers: vi.fn(() => usersResponse),
      getAssignments: vi.fn(() => assignmentsResponse),
      assignCourse: vi.fn(() => of(assignment)),
      createUser: vi.fn(() => of(createdUser)),
    };
    const courseService = { getCourses: vi.fn(() => coursesResponse) };
    const snackBar: Pick<MatSnackBar, 'open'> = { open: vi.fn() };
    const dialog = {
      open: vi.fn(() => ({ afterClosed: (): Observable<AppUser | undefined> => of(undefined) })),
    };
    TestBed.configureTestingModule({
      imports: [AdminUserManagementComponent],
      providers: [
        { provide: AdminUserService, useValue: adminService },
        { provide: AuthService, useValue: { currentRole: signal(role) } },
        { provide: CourseManagementService, useValue: courseService },
      ],
    });
    TestBed.overrideProvider(MatDialog, { useValue: dialog });
    TestBed.overrideProvider(MatSnackBar, { useValue: snackBar });
    const fixture = TestBed.createComponent(AdminUserManagementComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component, adminService, courseService, snackBar, dialog };
  }

  it('shows Add User for ADMIN and opens the user form dialog', () => {
    const { fixture, component, dialog } = create();
    const button = fixture.nativeElement.querySelector('.add-user-button') as HTMLButtonElement;
    expect(button.textContent).toContain('Add User');

    button.click();

    expect(dialog.open).toHaveBeenCalledWith(
      AdminUserFormComponent,
      expect.objectContaining({
        width: '620px',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      }),
    );
    expect(component.canCreateUser()).toBe(true);
  });

  it.each(['USER', 'INSTRUCTOR'] as const)('hides user creation from %s', (role) => {
    const { fixture, component, dialog } = create(of(users), of(courses), of([]), role);
    expect(fixture.nativeElement.querySelector('.add-user-button')).toBeNull();
    component.openCreateUserForm();
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('refreshes users after creation without clearing the selected user or assignments', () => {
    const userResponses = [users, [...users, createdUser]];
    const usersResponse = defer(() => of(userResponses.shift()!));
    const { component, adminService, dialog, snackBar } = create(
      usersResponse,
      of(courses),
      of([assignment]),
    );
    component.selectUser(users[0]);
    dialog.open.mockReturnValue({ afterClosed: () => of(createdUser) });

    component.openCreateUserForm();

    expect(adminService.getUsers).toHaveBeenCalledTimes(2);
    expect(component.users()).toEqual([...users, createdUser]);
    expect(component.selectedUser()).toEqual(users[0]);
    expect(component.assignments()).toEqual([assignment]);
    expect(snackBar.open).toHaveBeenCalledWith('User created successfully.', 'Dismiss', {
      duration: 3500,
    });
  });

  it('loads and renders users', () => {
    const { fixture, component, adminService, courseService } = create();
    expect(adminService.getUsers).toHaveBeenCalledOnce();
    expect(courseService.getCourses).toHaveBeenCalledOnce();
    expect(component.users()).toEqual(users);
    expect(fixture.nativeElement.textContent).toContain('Learner One');
    expect(fixture.nativeElement.textContent).toContain('learner@example.com');
    expect(
      Array.from<HTMLTableCellElement>(fixture.nativeElement.querySelectorAll('th')).map((cell) =>
        cell.textContent?.trim(),
      ),
    ).toEqual(['User', 'Role', 'Action']);
    const action = fixture.nativeElement.querySelector('.row-actions button') as HTMLButtonElement;
    expect(action.textContent).toContain('View assignments');
    expect(action.getAttribute('aria-label')).toBe('View course assignments for Learner One');
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
const createdUser: AppUser = {
  id: 5,
  name: 'New Instructor',
  email: 'instructor@example.com',
  role: 'INSTRUCTOR',
};
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
