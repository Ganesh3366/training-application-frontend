import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { defer, Observable, of, Subject, throwError } from 'rxjs';
import { CourseManagementResponse } from '../../models/app.models';
import { CourseManagementService } from '../../services/course-management';
import { CourseManagementComponent } from './course-management';
import { CourseFormComponent } from './course-form/course-form';
import { DeleteCourseDialog } from './delete-course-dialog/delete-course-dialog';

describe('CourseManagementComponent', () => {
  function create(getCourses: Observable<CourseManagementResponse[]> = of([course])) {
    const deleteCourse = vi.fn(() => of(undefined));
    const service = {
      getCourses: vi.fn(() => getCourses),
      deleteCourse,
      createCourse: vi.fn(),
      updateCourse: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [CourseManagementComponent],
      providers: [{ provide: CourseManagementService, useValue: service }],
    });
    const fixture = TestBed.createComponent(CourseManagementComponent);
    const component = fixture.componentInstance;
    const componentDialog = (component as unknown as { dialog: MatDialog }).dialog;
    const componentSnackBar = (component as unknown as { snackBar: MatSnackBar }).snackBar;
    const open = vi.spyOn(componentDialog, 'open');
    vi.spyOn(componentSnackBar, 'open').mockReturnValue({} as never);
    fixture.detectChanges();
    return { fixture, component, open, deleteCourse, service };
  }

  it('shows loading and then renders the course list', () => {
    const response = new Subject<CourseManagementResponse[]>();
    const { fixture } = create(response);
    expect(fixture.nativeElement.textContent).toContain('Loading courses');
    response.next([course]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Angular Basics');
    expect(fixture.nativeElement.textContent).toContain('Information Technology (IT)');
    expect(fixture.nativeElement.querySelector('thead[role="rowgroup"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('th[role="columnheader"]')).toHaveLength(6);
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Edit Angular Basics"]'),
    ).not.toBeNull();
  });

  it('shows an actionable empty state', () => {
    const { fixture } = create(of([]));
    expect(fixture.nativeElement.textContent).toContain('No courses yet');
    expect(fixture.nativeElement.textContent).toContain('Create Course');
  });

  it('shows a safe API error state', () => {
    const { fixture } = create(throwError(() => new HttpErrorResponse({ status: 500 })));
    expect(fixture.nativeElement.textContent).toContain('Courses could not be loaded');
    expect(fixture.nativeElement.textContent).not.toContain('HttpErrorResponse');
  });

  it('recovers when retry succeeds after the initial list request fails', () => {
    const responses = [throwError(() => new HttpErrorResponse({ status: 500 })), of([course])];
    const { fixture, service } = create(defer(() => responses.shift()!));
    expect(fixture.nativeElement.textContent).toContain('Courses could not be loaded');

    const retryButton = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Try again'))!;
    retryButton.click();
    fixture.detectChanges();

    expect(service.getCourses).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.textContent).toContain('Angular Basics');
  });

  it('opens the reusable form and updates local state after create and edit', () => {
    const { component, open, service } = create();
    open.mockReturnValueOnce({ afterClosed: () => of(created) } as never);
    component.openCreateForm();
    expect(open).toHaveBeenLastCalledWith(
      CourseFormComponent,
      expect.objectContaining({ data: { course: null } }),
    );
    expect(component.courses()).toEqual([course, created]);
    expect(service.getCourses).toHaveBeenCalledOnce();

    const updated = { ...course, title: 'Updated Angular' };
    open.mockReturnValueOnce({ afterClosed: () => of(updated) } as never);
    component.openEditForm(course);
    expect(component.courses()[0].title).toBe('Updated Angular');
    expect(service.getCourses).toHaveBeenCalledOnce();
  });

  it('requires confirmation and cancel does not delete', () => {
    const { component, open, deleteCourse } = create();
    open.mockReturnValue({ afterClosed: () => of(false) } as never);
    component.confirmDelete(course);
    expect(open).toHaveBeenCalledWith(
      DeleteCourseDialog,
      expect.objectContaining({ data: { title: course.title } }),
    );
    expect(deleteCourse).not.toHaveBeenCalled();
  });

  it('deletes after confirmation and updates local state', () => {
    const { component, open, deleteCourse, service } = create();
    open.mockReturnValue({ afterClosed: () => of(true) } as never);
    component.confirmDelete(course);
    expect(deleteCourse).toHaveBeenCalledWith(7);
    expect(component.courses()).toEqual([]);
    expect(service.getCourses).toHaveBeenCalledOnce();
  });

  it('prevents a second delete while the first delete request is pending', () => {
    const pending = new Subject<undefined>();
    const { component, open, deleteCourse } = create();
    open.mockReturnValue({ afterClosed: () => of(true) } as never);
    deleteCourse.mockReturnValue(pending);

    component.confirmDelete(course);
    component.confirmDelete(created);

    expect(deleteCourse).toHaveBeenCalledOnce();
    expect(deleteCourse).toHaveBeenCalledWith(course.id);
  });

  it('shows the approved conflict message for a 409 response', () => {
    const { component, open, deleteCourse } = create();
    open.mockReturnValue({ afterClosed: () => of(true) } as never);
    deleteCourse.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    component.confirmDelete(course);
    expect(component.actionError()).toContain('modules or protected learner/certificate data');
    expect(component.courses()).toEqual([course]);
  });
});

const course: CourseManagementResponse = {
  id: 7,
  title: 'Angular Basics',
  description: 'Learn Angular',
  instructor: 'Ada',
  duration: 8,
  level: 'BEGINNER',
  category: 'INFORMATION_TECHNOLOGY',
};
const created: CourseManagementResponse = { ...course, id: 8, title: 'Advanced Angular' };
