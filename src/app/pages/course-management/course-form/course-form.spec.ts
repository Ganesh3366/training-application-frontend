import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, of, throwError } from 'rxjs';
import { CourseManagementRequest, CourseManagementResponse } from '../../../models/app.models';
import { CourseManagementService } from '../../../services/course-management';
import { COURSE_CATEGORY_OPTIONS, COURSE_LEVEL_OPTIONS } from '../course-management-options';
import { CourseFormComponent, CourseFormDialogData } from './course-form';

describe('CourseFormComponent', () => {
  function create(data: CourseFormDialogData = { course: null }) {
    const close = vi.fn();
    const dialogRef = { close, disableClose: false };
    const createCourse = vi.fn(() => of(course));
    const updateCourse = vi.fn(() => of(course));
    TestBed.configureTestingModule({
      imports: [CourseFormComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: CourseManagementService, useValue: { createCourse, updateCourse } },
      ],
    });
    const fixture = TestBed.createComponent(CourseFormComponent);
    fixture.detectChanges();
    return {
      fixture,
      component: fixture.componentInstance,
      close,
      dialogRef,
      createCourse,
      updateCourse,
    };
  }

  it('shows required validation without submitting an invalid form', () => {
    const { component, createCourse } = create();
    component.form.patchValue({ title: ' ', description: '', instructor: '' });
    component.submit();
    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.title.touched).toBe(true);
    expect(createCourse).not.toHaveBeenCalled();
  });

  it('uses shared options and gives initial focus priority to the course title', () => {
    const { fixture, component } = create();
    expect(component.levelOptions).toBe(COURSE_LEVEL_OPTIONS);
    expect(component.categoryOptions).toBe(COURSE_CATEGORY_OPTIONS);
    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="title"][cdkfocusinitial]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="instructor"]').autocomplete,
    ).toBe('off');
  });

  it('sends one trimmed create request and prevents duplicate submission', () => {
    const pending = new Subject<CourseManagementResponse>();
    const { component, createCourse, close } = create();
    createCourse.mockReturnValue(pending);
    component.form.setValue({ ...request, title: '  Angular Basics  ' });
    component.submit();
    component.submit();
    expect(createCourse).toHaveBeenCalledOnce();
    expect(createCourse).toHaveBeenCalledWith(request);
    pending.next(course);
    expect(close).toHaveBeenCalledWith(course);
  });

  it.each([0, -1, 1.5, Number.NaN])('rejects non-positive-integer duration %s', (duration) => {
    const { component, createCourse } = create();
    component.form.setValue({ ...request, duration });
    component.submit();
    expect(component.form.controls.duration.hasError('positiveInteger')).toBe(true);
    expect(createCourse).not.toHaveBeenCalled();
  });

  it('prevents dialog dismissal while saving and restores it after an error', () => {
    const pending = new Subject<CourseManagementResponse>();
    const { component, createCourse, close, dialogRef } = create();
    createCourse.mockReturnValue(pending);
    component.form.setValue(request);
    component.submit();
    expect(dialogRef.disableClose).toBe(true);
    component.close();
    expect(close).not.toHaveBeenCalled();

    pending.error(new HttpErrorResponse({ status: 500 }));
    expect(dialogRef.disableClose).toBe(false);
    component.close();
    expect(close).toHaveBeenCalledOnce();
  });

  it('populates and submits the shared form in edit mode', () => {
    const { component, updateCourse } = create({ course });
    expect(component.isEditMode).toBe(true);
    expect(component.form.getRawValue()).toEqual(request);
    component.submit();
    expect(updateCourse).toHaveBeenCalledWith(7, request);
  });

  it('preserves values and exposes safe feedback after backend validation failure', () => {
    const { component, createCourse } = create();
    createCourse.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 400 })));
    component.form.setValue(request);
    component.submit();
    expect(component.form.getRawValue()).toEqual(request);
    expect(component.submissionError()).toContain('invalid');
    expect(component.submitting()).toBe(false);
  });
});

const request: CourseManagementRequest = {
  title: 'Angular Basics',
  description: 'Learn Angular',
  instructor: 'Ada',
  duration: 8,
  level: 'BEGINNER',
  category: 'INFORMATION_TECHNOLOGY',
};
const course: CourseManagementResponse = { id: 7, ...request };
