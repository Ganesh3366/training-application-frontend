import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppUser, CourseAssignment, CourseManagementResponse } from '../../models/app.models';
import { AdminUserService } from '../../services/admin-user';
import { AuthService } from '../../services/auth';
import { CourseManagementService } from '../../services/course-management';
import { EditUserFormComponent, EditUserFormData } from './edit-user-form/edit-user-form';
import { AdminUserFormComponent } from './user-form/user-form';
import { UserStatusDialog, UserStatusDialogData } from './user-status-dialog/user-status-dialog';

@Component({
  selector: 'app-admin-user-management',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './admin-user-management.html',
  styleUrl: './admin-user-management.css',
})
export class AdminUserManagementComponent {
  private readonly adminUsers = inject(AdminUserService);
  private readonly auth = inject(AuthService);
  private readonly courseManagement = inject(CourseManagementService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private assignmentRequestVersion = 0;

  readonly users = signal<AppUser[]>([]);
  readonly courses = signal<CourseManagementResponse[]>([]);
  readonly assignments = signal<CourseAssignment[]>([]);
  readonly selectedUser = signal<AppUser | null>(null);
  readonly selectedCourseId = signal<number | null>(null);
  readonly canCreateUser = computed(() => this.auth.currentRole() === 'ADMIN');

  readonly usersLoading = signal(true);
  readonly usersError = signal<string | null>(null);
  readonly coursesLoading = signal(true);
  readonly coursesError = signal<string | null>(null);
  readonly assignmentsLoading = signal(false);
  readonly assignmentsError = signal<string | null>(null);
  readonly assignmentPending = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly userActionError = signal<string | null>(null);
  readonly enabledRequestUserId = signal<number | null>(null);

  readonly availableCourses = computed(() => {
    const assignedCourseIds = new Set(this.assignments().map((assignment) => assignment.course.id));
    return this.courses().filter((course) => !assignedCourseIds.has(course.id));
  });

  readonly canAssign = computed(() => {
    const courseId = this.selectedCourseId();
    return (
      this.selectedUser() !== null &&
      courseId !== null &&
      this.availableCourses().some((course) => course.id === courseId) &&
      !this.assignmentsLoading() &&
      !this.assignmentPending()
    );
  });

  constructor() {
    this.loadUsers();
    this.loadCourses();
  }

  openCreateUserForm(): void {
    if (!this.canCreateUser()) return;

    const dialogRef = this.dialog.open<AdminUserFormComponent, undefined, AppUser>(
      AdminUserFormComponent,
      {
        width: '620px',
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: 'calc(100dvh - 24px)',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      },
    );

    dialogRef.afterClosed().subscribe((createdUser) => {
      if (!createdUser) return;
      this.loadUsers();
      this.snackBar.open('User created successfully.', 'Dismiss', { duration: 3500 });
    });
  }

  openEditUserForm(user: AppUser): void {
    if (!this.canCreateUser()) return;

    this.userActionError.set(null);
    const dialogRef = this.dialog.open<EditUserFormComponent, EditUserFormData, AppUser>(
      EditUserFormComponent,
      {
        data: { user, editingCurrentAdmin: this.isCurrentUser(user) },
        width: '620px',
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: 'calc(100dvh - 24px)',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      },
    );

    dialogRef.afterClosed().subscribe((updatedUser) => {
      if (!updatedUser) return;
      this.applyUpdatedUser(updatedUser);
      this.snackBar.open('User updated successfully.', 'Dismiss', { duration: 3500 });
    });
  }

  confirmDeactivateUser(user: AppUser): void {
    if (
      !this.canCreateUser() ||
      !user.enabled ||
      this.isCurrentUser(user) ||
      this.enabledRequestUserId() !== null
    )
      return;

    this.userActionError.set(null);
    const dialogRef = this.dialog.open<UserStatusDialog, UserStatusDialogData, boolean>(
      UserStatusDialog,
      {
        data: { user },
        width: '500px',
        maxWidth: 'calc(100vw - 32px)',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      },
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && this.canCreateUser()) this.setUserEnabled(user, false);
    });
  }

  reactivateUser(user: AppUser): void {
    if (!this.canCreateUser() || user.enabled || this.enabledRequestUserId() !== null) return;
    this.userActionError.set(null);
    this.setUserEnabled(user, true);
  }

  isCurrentUser(user: AppUser): boolean {
    return this.auth.currentUser()?.id === user.id;
  }

  loadUsers(): void {
    this.usersLoading.set(true);
    this.usersError.set(null);
    this.adminUsers.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        const selectedUser = this.selectedUser();
        const refreshedSelection = users.find((user) => user.id === selectedUser?.id);
        if (refreshedSelection) this.selectedUser.set(refreshedSelection);
        this.usersLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.usersError.set(this.loadErrorMessage(error, 'users'));
        this.usersLoading.set(false);
      },
    });
  }

  loadCourses(): void {
    this.coursesLoading.set(true);
    this.coursesError.set(null);
    this.courseManagement.getCourses().subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.coursesLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.coursesError.set(this.loadErrorMessage(error, 'courses'));
        this.coursesLoading.set(false);
      },
    });
  }

  selectUser(user: AppUser, reload = false): void {
    if (this.assignmentPending() || (!reload && this.selectedUser()?.id === user.id)) return;

    const requestVersion = ++this.assignmentRequestVersion;
    this.selectedUser.set(user);
    this.selectedCourseId.set(null);
    this.assignments.set([]);
    this.assignmentsError.set(null);
    this.actionError.set(null);
    this.assignmentsLoading.set(true);

    this.adminUsers.getAssignments(user.id).subscribe({
      next: (assignments) => {
        if (requestVersion !== this.assignmentRequestVersion) return;
        this.assignments.set(assignments);
        this.assignmentsLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        if (requestVersion !== this.assignmentRequestVersion) return;
        this.assignmentsError.set(this.assignmentLoadErrorMessage(error));
        this.assignmentsLoading.set(false);
      },
    });
  }

  assignCourse(): void {
    const user = this.selectedUser();
    const courseId = this.selectedCourseId();
    if (
      !user ||
      courseId === null ||
      this.assignmentPending() ||
      this.assignmentsLoading() ||
      !this.availableCourses().some((course) => course.id === courseId)
    )
      return;

    this.assignmentPending.set(true);
    this.actionError.set(null);
    this.adminUsers.assignCourse(user.id, courseId).subscribe({
      next: (assignment) => {
        this.assignments.update((assignments) => [...assignments, assignment]);
        this.selectedCourseId.set(null);
        this.assignmentPending.set(false);
        this.snackBar.open('Course assigned successfully.', 'Dismiss', { duration: 3500 });
      },
      error: (error: HttpErrorResponse) => {
        this.actionError.set(this.assignmentErrorMessage(error));
        this.assignmentPending.set(false);
      },
    });
  }

  private setUserEnabled(user: AppUser, enabled: boolean): void {
    if (!this.canCreateUser() || (!enabled && this.isCurrentUser(user))) return;
    this.enabledRequestUserId.set(user.id);
    this.adminUsers.setUserEnabled(user.id, enabled).subscribe({
      next: (updatedUser) => {
        this.applyUpdatedUser(updatedUser);
        this.enabledRequestUserId.set(null);
        this.snackBar.open(enabled ? 'User reactivated.' : 'User deactivated.', 'Dismiss', {
          duration: 3500,
        });
      },
      error: (error: HttpErrorResponse) => {
        this.userActionError.set(this.enabledErrorMessage(error, enabled));
        this.enabledRequestUserId.set(null);
      },
    });
  }

  private applyUpdatedUser(updatedUser: AppUser): void {
    this.users.update((users) =>
      users.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    );
    if (this.selectedUser()?.id === updatedUser.id) this.selectedUser.set(updatedUser);
  }

  private loadErrorMessage(error: HttpErrorResponse, resource: 'users' | 'courses'): string {
    if (error.status === 403) return 'You do not have permission to manage user assignments.';
    if (error.status === 0)
      return 'Unable to reach SkillForge. Check your connection and try again.';
    return `Unable to load ${resource}. Please try again.`;
  }

  private assignmentLoadErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 403) return 'You do not have permission to view course assignments.';
    if (error.status === 404) return 'This user no longer exists. Return to the user list.';
    if (error.status === 0)
      return 'Unable to reach SkillForge. Check your connection and try again.';
    return 'Unable to load course assignments. Please try again.';
  }

  private assignmentErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 403) return 'You do not have permission to assign courses.';
    if (error.status === 404)
      return 'The selected user or course no longer exists. Refresh the page and try again.';
    if (error.status === 409) return 'This course is already assigned to the selected user.';
    if (error.status === 0)
      return 'Unable to reach SkillForge. Check your connection and try again.';
    return 'Unable to assign the course. Please try again.';
  }

  private enabledErrorMessage(error: HttpErrorResponse, enabled: boolean): string {
    if (error.status === 400 && this.errorDetail(error) === 'You cannot disable your own account') {
      return 'You cannot deactivate your own account.';
    }
    if (error.status === 400)
      return `Unable to ${enabled ? 'reactivate' : 'deactivate'} this user. Review the request and try again.`;
    if (error.status === 401 || error.status === 403)
      return 'You do not have permission to change user access.';
    if (error.status === 404) return 'This user no longer exists. Refresh the list and try again.';
    if (error.status === 0)
      return 'Unable to reach SkillForge. Check your connection and try again.';
    return `Unable to ${enabled ? 'reactivate' : 'deactivate'} the user. Please try again.`;
  }

  private errorDetail(error: HttpErrorResponse): string | null {
    const body = error.error;
    if (!body || typeof body !== 'object' || !('detail' in body)) return null;
    return typeof body.detail === 'string' ? body.detail : null;
  }
}
