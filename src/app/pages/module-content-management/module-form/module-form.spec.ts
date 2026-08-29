import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, of } from 'rxjs';
import { CourseModule, CourseModuleManagementRequest } from '../../../models/app.models';
import { CourseModuleManagementService } from '../../../services/course-module-management';
import { ModuleFormComponent, ModuleFormDialogData } from './module-form';

describe('ModuleFormComponent', () => {
  function create(data: ModuleFormDialogData = { courseId: 7, module: null }) {
    const ref = { close: vi.fn(), disableClose: false };
    const createModule = vi.fn(() => of(module));
    const updateModule = vi.fn(() => of(module));
    TestBed.configureTestingModule({
      imports: [ModuleFormComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: ref },
        { provide: CourseModuleManagementService, useValue: { createModule, updateModule } },
      ],
    });
    const fixture = TestBed.createComponent(ModuleFormComponent);
    fixture.detectChanges();
    return { component: fixture.componentInstance, ref, createModule, updateModule };
  }

  it('requires a nonblank title', () => {
    const { component, createModule } = create();
    component.form.setValue({ title: ' ', description: '' });
    component.submit();
    expect(component.form.controls.title.invalid).toBe(true);
    expect(createModule).not.toHaveBeenCalled();
  });

  it('creates with trimmed title and normalized optional description', () => {
    const { component, createModule } = create();
    component.form.setValue({ title: '  Foundations  ', description: '   ' });
    component.submit();
    expect(createModule).toHaveBeenCalledWith(7, request);
  });

  it('populates and updates through the same form', () => {
    const { component, updateModule } = create({ courseId: 7, module });
    expect(component.form.getRawValue()).toEqual({
      title: module.title,
      description: '',
    });
    component.submit();
    expect(updateModule).toHaveBeenCalledWith(7, 3, request);
  });

  it('prevents duplicate submissions and displays a safe API error', () => {
    const pending = new Subject<CourseModule>();
    const { component, createModule, ref } = create();
    createModule.mockReturnValue(pending);
    component.form.setValue({ title: 'Foundations', description: '' });
    component.submit();
    component.submit();
    expect(createModule).toHaveBeenCalledOnce();
    expect(ref.disableClose).toBe(true);
    pending.error(new HttpErrorResponse({ status: 500 }));
    expect(component.submissionError()).toBe('Unable to save the module. Please try again.');
    expect(ref.disableClose).toBe(false);
  });
});

const request: CourseModuleManagementRequest = { title: 'Foundations', description: null };
const module: CourseModule = { id: 3, title: 'Foundations', description: null, position: 1 };
