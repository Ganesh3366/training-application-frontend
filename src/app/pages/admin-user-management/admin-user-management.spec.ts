import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { defer, Observable, of, Subject, throwError } from 'rxjs';
import { AppUser, CourseAssignment, CourseManagementResponse, Role } from '../../models/app.models';
import { AdminUserService } from '../../services/admin-user';
import { AuthService } from '../../services/auth';
import { CourseManagementService } from '../../services/course-management';
import { AdminUserManagementComponent } from './admin-user-management';
import { EditUserFormComponent } from './edit-user-form/edit-user-form';
import { AdminUserFormComponent } from './user-form/user-form';
import { UserStatusDialog } from './user-status-dialog/user-status-dialog';

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
      updateUser: vi.fn(),
      setUserEnabled: vi.fn((_userId: number, enabled: boolean) => of({ ...users[0], enabled })),
    };
    const courseService = { getCourses: vi.fn(() => coursesResponse) };
    const snackBar: Pick<MatSnackBar, 'open'> = { open: vi.fn() };
    const dialog = {
      open: vi.fn(() => ({ afterClosed: (): Observable<unknown> => of(undefined) })),
    };
    const currentUser = signal<AppUser | null>(
      role
        ? {
            id: 1,
            name: 'Current User',
            email: 'current@example.com',
            role,
            enabled: true,
          }
        : null,
    );
    TestBed.configureTestingModule({
      imports: [AdminUserManagementComponent],
      providers: [
        { provide: AdminUserService, useValue: adminService },
        { provide: AuthService, useValue: { currentRole: signal(role), currentUser } },
        { provide: CourseManagementService, useValue: courseService },
      ],
    });
    TestBed.overrideProvider(MatDialog, { useValue: dialog });
    TestBed.overrideProvider(MatSnackBar, { useValue: snackBar });
    const fixture = TestBed.createComponent(AdminUserManagementComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component, adminService, courseService, snackBar, dialog, currentUser };
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
    const { fixture, component, dialog, adminService } = create(
      of([users[0], inactiveUser]),
      of(courses),
      of([]),
      role,
    );
    expect(fixture.nativeElement.querySelector('.add-user-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.edit-user-action')).toBeNull();
    expect(fixture.nativeElement.querySelector('.more-actions-trigger')).toBeNull();
    expect(fixture.nativeElement.querySelector('.user-enabled-action')).toBeNull();
    component.openCreateUserForm();
    component.openEditUserForm(users[0]);
    component.confirmDeactivateUser(users[0]);
    component.reactivateUser(inactiveUser);
    expect(dialog.open).not.toHaveBeenCalled();
    expect(adminService.setUserEnabled).not.toHaveBeenCalled();
  });

  it('keeps the row action menu as the only visible action entry and exposes the menu trigger', () => {
    const { fixture } = create(of([users[0], inactiveUser]));
    const rows = fixture.nativeElement.querySelectorAll(
      'tbody tr',
    ) as NodeListOf<HTMLTableRowElement>;

    expect(rows[0].textContent).toContain('Active');
    expect(rows[0].querySelector('.view-assignments-action')).toBeNull();
    expect(rows[0].querySelector('.edit-user-action')).toBeNull();
    expect(rows[0].querySelector('.more-actions-trigger')?.getAttribute('aria-label')).toBe(
      'More actions for Learner One',
    );

    expect(rows[1].textContent).toContain('Inactive');
    expect(rows[1].querySelector('.more-actions-trigger')?.getAttribute('aria-label')).toBe(
      'More actions for Inactive Learner',
    );
  });

  it('shows the correct actions in each Material menu', async () => {
    const { fixture } = create(of([users[0], inactiveUser]));
    const triggers = fixture.debugElement.queryAll(By.directive(MatMenuTrigger));

    triggers[0].injector.get(MatMenuTrigger).openMenu();
    fixture.detectChanges();
    await fixture.whenStable();

    let menu = Array.from(document.querySelectorAll('[role="menu"]')).at(-1) as HTMLElement;
    expect(menu.textContent).toContain('View assignments');
    expect(menu.textContent).toContain('Edit');
    expect(menu.textContent).toContain('Deactivate');
    expect(menu.textContent).not.toContain('Reactivate');

    triggers[0].injector.get(MatMenuTrigger).closeMenu();
    fixture.detectChanges();
    await fixture.whenStable();
    triggers[1].injector.get(MatMenuTrigger).openMenu();
    fixture.detectChanges();
    await fixture.whenStable();

    menu = Array.from(document.querySelectorAll('[role="menu"]')).at(-1) as HTMLElement;
    expect(menu.textContent).toContain('View assignments');
    expect(menu.textContent).toContain('Edit');
    expect(menu.textContent).toContain('Reactivate');
    expect(menu.textContent).not.toContain('Deactivate');
  });

  it('opens Edit User and applies the safe response without clearing assignment state', () => {
    const { component, adminService, dialog, snackBar } = create(
      of(users),
      of(courses),
      of([assignment]),
    );
    component.selectUser(users[0]);
    dialog.open.mockReturnValue({ afterClosed: () => of(updatedUser) });

    component.openEditUserForm(users[0]);

    expect(dialog.open).toHaveBeenCalledWith(
      EditUserFormComponent,
      expect.objectContaining({
        data: { user: users[0], editingCurrentAdmin: false },
      }),
    );
    expect(component.users()).toEqual([updatedUser]);
    expect(component.selectedUser()).toEqual(updatedUser);
    expect(component.assignments()).toEqual([assignment]);
    expect(adminService.getAssignments).toHaveBeenCalledOnce();
    expect(snackBar.open).toHaveBeenCalledWith('User updated successfully.', 'Dismiss', {
      duration: 3500,
    });
  });

  it('requires deactivation confirmation and cancellation sends no request', () => {
    const { component, dialog, adminService } = create();
    dialog.open.mockReturnValue({ afterClosed: () => of(false) });

    component.confirmDeactivateUser(users[0]);

    expect(dialog.open).toHaveBeenCalledWith(
      UserStatusDialog,
      expect.objectContaining({ data: { user: users[0] } }),
    );
    expect(adminService.setUserEnabled).not.toHaveBeenCalled();
  });

  it('deactivates after confirmation and preserves selected assignments', () => {
    const disabledUser = { ...users[0], enabled: false };
    const { component, dialog, adminService } = create(of(users), of(courses), of([assignment]));
    component.selectUser(users[0]);
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    adminService.setUserEnabled.mockReturnValue(of(disabledUser));

    component.confirmDeactivateUser(users[0]);

    expect(adminService.setUserEnabled).toHaveBeenCalledWith(users[0].id, false);
    expect(component.users()).toEqual([disabledUser]);
    expect(component.selectedUser()).toEqual(disabledUser);
    expect(component.assignments()).toEqual([assignment]);
  });

  it('reactivates directly and reflects enabled=true', () => {
    const reactivatedUser = { ...inactiveUser, enabled: true };
    const { component, adminService } = create(of([inactiveUser]));
    adminService.setUserEnabled.mockReturnValue(of(reactivatedUser));

    component.reactivateUser(inactiveUser);

    expect(adminService.setUserEnabled).toHaveBeenCalledWith(inactiveUser.id, true);
    expect(component.users()).toEqual([reactivatedUser]);
  });

  it('hides the deactivate action for the current admin without removing the menu trigger', () => {
    const currentAdmin: AppUser = {
      id: 1,
      name: 'Current Admin',
      email: 'admin@example.com',
      role: 'ADMIN',
      enabled: true,
    };
    const { fixture, component, dialog, adminService } = create(of([currentAdmin]));

    expect(fixture.nativeElement.querySelector('.more-actions-trigger')).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Deactivate');

    component.confirmDeactivateUser(currentAdmin);
    expect(dialog.open).not.toHaveBeenCalled();
    expect(adminService.setUserEnabled).not.toHaveBeenCalled();
  });

  it('maps a backend self-deactivation rejection without exposing raw error details', () => {
    const { component, dialog, adminService } = create();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    adminService.setUserEnabled.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: {
              detail: 'You cannot disable your own account',
              trace: 'sensitive stack trace',
            },
          }),
      ),
    );

    component.confirmDeactivateUser(users[0]);

    expect(component.userActionError()).toBe('You cannot deactivate your own account.');
    expect(component.userActionError()).not.toContain('stack');
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

  it('loads and renders users with the action trigger in the table action column', () => {
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
    ).toEqual(['User', 'Role', 'Status', 'Action']);
    const actionTrigger = fixture.nativeElement.querySelector(
      '.row-actions .more-actions-trigger',
    ) as HTMLButtonElement;
    expect(actionTrigger).not.toBeNull();
    expect(actionTrigger.getAttribute('aria-label')).toBe('More actions for Learner One');
    expect(fixture.nativeElement.querySelector('.table-wrap thead')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.view-assignments-action')).toBeNull();
    expect(fixture.nativeElement.querySelector('.edit-user-action')).toBeNull();
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
  { id: 4, name: 'Learner One', email: 'learner@example.com', role: 'USER', enabled: true },
];
const inactiveUser: AppUser = {
  id: 6,
  name: 'Inactive Learner',
  email: 'inactive@example.com',
  role: 'USER',
  enabled: false,
};
const createdUser: AppUser = {
  id: 5,
  name: 'New Instructor',
  email: 'instructor@example.com',
  role: 'INSTRUCTOR',
  enabled: true,
};
const updatedUser: AppUser = {
  ...users[0],
  name: 'Updated Learner',
  email: 'updated@example.com',
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
