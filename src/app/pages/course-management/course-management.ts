import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  CourseManagementCategory,
  CourseManagementLevel,
  CourseManagementResponse,
} from '../../models/app.models';
import { CourseManagementService } from '../../services/course-management';
import { CourseFormComponent, CourseFormDialogData } from './course-form/course-form';
import {
  DeleteCourseDialog,
  DeleteCourseDialogData,
} from './delete-course-dialog/delete-course-dialog';
import { COURSE_CATEGORY_LABELS, COURSE_LEVEL_LABELS } from './course-management-options';

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './course-management.html',
  styleUrl: './course-management.css',
})
export class CourseManagementComponent {
  private readonly courseManagement = inject(CourseManagementService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly courses = signal<CourseManagementResponse[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly deletingCourseId = signal<number | null>(null);

  constructor() {
    this.loadCourses();
  }

  loadCourses(): void {
    if (this.loading() && this.courses().length > 0) return;
    this.loading.set(true);
    this.loadError.set(null);
    this.courseManagement.getCourses().subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loadError.set(this.loadErrorMessage(error));
        this.loading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.openCourseForm(null);
  }

  openEditForm(course: CourseManagementResponse): void {
    this.openCourseForm(course);
  }

  confirmDelete(course: CourseManagementResponse): void {
    this.actionError.set(null);
    const dialogRef = this.dialog.open<DeleteCourseDialog, DeleteCourseDialogData, boolean>(
      DeleteCourseDialog,
      {
        data: { title: course.title },
        width: '470px',
        maxWidth: 'calc(100vw - 32px)',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      },
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.deleteCourse(course);
    });
  }

  levelLabel(level: CourseManagementLevel): string {
    return COURSE_LEVEL_LABELS[level];
  }

  categoryLabel(category: CourseManagementCategory): string {
    return COURSE_CATEGORY_LABELS[category];
  }

  private openCourseForm(course: CourseManagementResponse | null): void {
    this.actionError.set(null);
    const dialogRef = this.dialog.open<
      CourseFormComponent,
      CourseFormDialogData,
      CourseManagementResponse
    >(CourseFormComponent, {
      data: { course },
      width: '680px',
      maxWidth: 'calc(100vw - 24px)',
      maxHeight: 'calc(100dvh - 24px)',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe((savedCourse) => {
      if (!savedCourse) return;
      this.courses.update((courses) =>
        course
          ? courses.map((item) => (item.id === savedCourse.id ? savedCourse : item))
          : [...courses, savedCourse],
      );
      this.showSuccess(course ? 'Course updated.' : 'Course created.');
    });
  }

  private deleteCourse(course: CourseManagementResponse): void {
    if (this.deletingCourseId() !== null) return;
    this.deletingCourseId.set(course.id);
    this.courseManagement.deleteCourse(course.id).subscribe({
      next: () => {
        this.courses.update((courses) => courses.filter((item) => item.id !== course.id));
        this.deletingCourseId.set(null);
        this.showSuccess('Course deleted.');
      },
      error: (error: HttpErrorResponse) => {
        this.actionError.set(this.deleteErrorMessage(error));
        this.deletingCourseId.set(null);
      },
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 3500 });
  }

  private loadErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 403) return 'You do not have permission to manage courses.';
    if (error.status === 0)
      return 'Unable to reach SkillForge. Check your connection and try again.';
    return 'Unable to load managed courses. Please try again.';
  }

  private deleteErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 409) {
      return 'This course cannot be deleted because it contains modules or protected learner/certificate data.';
    }
    if (error.status === 403) return 'You do not have permission to delete this course.';
    if (error.status === 404) return 'This course no longer exists. Refresh the list to continue.';
    return 'Unable to delete the course. Please try again.';
  }
}
