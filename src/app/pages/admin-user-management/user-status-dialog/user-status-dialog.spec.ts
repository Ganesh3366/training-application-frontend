import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppUser } from '../../../models/app.models';
import { UserStatusDialog } from './user-status-dialog';

describe('UserStatusDialog', () => {
  it('identifies the user, explains retained data and disabled login, and requires confirmation', () => {
    const close = vi.fn();
    TestBed.configureTestingModule({
      imports: [UserStatusDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { user } },
        { provide: MatDialogRef, useValue: { close } },
      ],
    });
    const fixture = TestBed.createComponent(UserStatusDialog);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    const buttons = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'));

    expect(text).toContain(user.name);
    expect(text).toContain(user.email);
    expect(text).toContain('remain in SkillForge');
    expect(text).toContain('login access will be disabled');
    expect(text.toLowerCase()).not.toContain('delete');

    buttons.find((button) => button.textContent?.trim() === 'Cancel')!.click();
    buttons.find((button) => button.textContent?.trim() === 'Deactivate')!.click();
    expect(close).toHaveBeenNthCalledWith(1, false);
    expect(close).toHaveBeenNthCalledWith(2, true);
  });
});

const user: AppUser = {
  id: 4,
  name: 'Learner One',
  email: 'learner@example.com',
  role: 'USER',
  enabled: true,
};
