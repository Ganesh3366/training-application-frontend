import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, of } from 'rxjs';
import { ModuleContent, ModuleContentManagementRequest } from '../../../models/app.models';
import { CourseModuleManagementService } from '../../../services/course-module-management';
import { ContentFormComponent, ContentFormDialogData } from './content-form';

describe('ContentFormComponent', () => {
  function create(data: ContentFormDialogData = { courseId: 7, moduleId: 3, content: null }) {
    const ref = { close: vi.fn(), disableClose: false };
    const createContent = vi.fn(() => of(textContent));
    const updateContent = vi.fn(() => of(textContent));
    TestBed.configureTestingModule({
      imports: [ContentFormComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: ref },
        { provide: CourseModuleManagementService, useValue: { createContent, updateContent } },
      ],
    });
    const fixture = TestBed.createComponent(ContentFormComponent);
    fixture.detectChanges();
    return { component: fixture.componentInstance, ref, createContent, updateContent };
  }

  it('requires type, title and text content for TEXT', () => {
    const { component, createContent } = create();
    component.form.patchValue({ title: ' ', textContent: ' ' });
    component.submit();
    expect(component.form.invalid).toBe(true);
    expect(createContent).not.toHaveBeenCalled();
  });

  it('requires a nonblank video URL for VIDEO', () => {
    const { component, createContent } = create();
    component.form.patchValue({ type: 'VIDEO', title: 'Demo', videoUrl: ' ' });
    component.submit();
    expect(component.form.controls.videoUrl.invalid).toBe(true);
    expect(createContent).not.toHaveBeenCalled();
  });

  it('clears stale opposite-type data when type changes', () => {
    const { component } = create();
    component.form.patchValue({
      textContent: 'Lesson text',
      videoUrl: 'https://example.test/video',
      type: 'VIDEO',
    });
    expect(component.form.controls.textContent.value).toBeNull();
    component.form.patchValue({ textContent: 'stale', type: 'TEXT' });
    expect(component.form.controls.videoUrl.value).toBeNull();
  });

  it('creates TEXT with null videoUrl', () => {
    const { component, createContent } = create();
    component.form.setValue({
      type: 'TEXT',
      title: ' Welcome ',
      textContent: ' Hello ',
      videoUrl: null,
    });
    component.submit();
    expect(createContent).toHaveBeenCalledWith(7, 3, textRequest);
  });

  it('creates VIDEO with null textContent', () => {
    const { component, createContent } = create();
    component.form.setValue({
      type: 'VIDEO',
      title: ' Demo ',
      textContent: null,
      videoUrl: ' https://example.test/video ',
    });
    component.submit();
    expect(createContent).toHaveBeenCalledWith(7, 3, videoRequest);
  });

  it('populates and updates through the same form', () => {
    const { component, updateContent } = create({ courseId: 7, moduleId: 3, content: textContent });
    component.submit();
    expect(updateContent).toHaveBeenCalledWith(7, 3, 9, textRequest);
  });

  it('prevents duplicate submission and uses safe error feedback', () => {
    const pending = new Subject<ModuleContent>();
    const { component, createContent, ref } = create();
    createContent.mockReturnValue(pending);
    component.form.setValue({
      type: 'TEXT',
      title: 'Welcome',
      textContent: 'Hello',
      videoUrl: null,
    });
    component.submit();
    component.submit();
    expect(createContent).toHaveBeenCalledOnce();
    pending.error(new HttpErrorResponse({ status: 500 }));
    expect(component.submissionError()).toBe('Unable to save the content. Please try again.');
    expect(ref.disableClose).toBe(false);
  });
});

const textRequest: ModuleContentManagementRequest = {
  type: 'TEXT',
  title: 'Welcome',
  textContent: 'Hello',
  videoUrl: null,
};
const videoRequest: ModuleContentManagementRequest = {
  type: 'VIDEO',
  title: 'Demo',
  textContent: null,
  videoUrl: 'https://example.test/video',
};
const textContent: ModuleContent = { id: 9, position: 1, ...textRequest };
