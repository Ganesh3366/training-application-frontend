import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmManagementDeleteDialog } from './confirm-delete-dialog';

describe('ConfirmManagementDeleteDialog', () => {
  it('returns the rendered cancel and delete choices', () => {
    const close = vi.fn();
    TestBed.configureTestingModule({
      imports: [ConfirmManagementDeleteDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { kind: 'module', name: 'Foundations' } },
        { provide: MatDialogRef, useValue: { close } },
      ],
    });
    const fixture = TestBed.createComponent(ConfirmManagementDeleteDialog);
    fixture.detectChanges();
    const buttons = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'));
    expect(fixture.nativeElement.textContent).toContain('Foundations');
    buttons.find((button) => button.textContent?.trim() === 'Cancel')!.click();
    buttons.find((button) => button.textContent?.trim() === 'Delete module')!.click();
    expect(close).toHaveBeenNthCalledWith(1, false);
    expect(close).toHaveBeenNthCalledWith(2, true);
  });
});
