import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeleteCourseDialog } from './delete-course-dialog';

describe('DeleteCourseDialog', () => {
  it('identifies the course and returns the rendered button choices', () => {
    const close = vi.fn();
    TestBed.configureTestingModule({
      imports: [DeleteCourseDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { title: 'Angular Basics' } },
        { provide: MatDialogRef, useValue: { close } },
      ],
    });
    const fixture = TestBed.createComponent(DeleteCourseDialog);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Angular Basics');

    const buttons = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'));
    const cancel = buttons.find((button) => button.textContent?.trim() === 'Cancel')!;
    const deletion = buttons.find((button) => button.textContent?.trim() === 'Delete course')!;
    expect(cancel.hasAttribute('cdkfocusinitial')).toBe(true);

    cancel.click();
    deletion.click();
    expect(close).toHaveBeenNthCalledWith(1, false);
    expect(close).toHaveBeenNthCalledWith(2, true);
  });
});
