import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';
import { AdminUserUpdateRequest, AppUser, Role } from '../../../models/app.models';
import { AdminUserService } from '../../../services/admin-user';
import { EditUserFormComponent, EditUserFormData } from './edit-user-form';

describe('EditUserFormComponent', () => {
  function create(data: EditUserFormData = { user, editingCurrentAdmin: false }) {
    const close = vi.fn();
    const dialogRef = { close, disableClose: false };
    const updateUser = vi.fn((_userId: number, _request: AdminUserUpdateRequest) =>
      of(updatedUser),
    );
    TestBed.configureTestingModule({
      imports: [EditUserFormComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: AdminUserService, useValue: { updateUser } },
      ],
    });
    const fixture = TestBed.createComponent(EditUserFormComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance, updateUser, close, dialogRef };
  }

  it('populates the existing safe user fields without rendering a password input', () => {
    const { fixture, component } = create();
    expect(component.form.getRawValue()).toEqual({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    expect(component.roleOptions).toEqual(['USER', 'INSTRUCTOR', 'ADMIN']);
    expect(fixture.nativeElement.querySelector('[formcontrolname="password"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[formcontrolname="name"]').autocomplete).toBe(
      'name',
    );
    expect(fixture.nativeElement.querySelector('[formcontrolname="email"]').autocomplete).toBe(
      'email',
    );
  });

  it('requires a nonblank name, valid email, and valid role', () => {
    const { component, updateUser } = create();
    component.form.setValue({ name: ' ', email: 'not-an-email', role: 'OWNER' as Role });
    component.submit();
    expect(component.form.controls.name.hasError('whitespace')).toBe(true);
    expect(component.form.controls.email.hasError('email')).toBe(true);
    expect(component.form.controls.role.hasError('role')).toBe(true);
    expect(component.form.controls.name.touched).toBe(true);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('enforces the backend name and email length limits', () => {
    const { component, updateUser } = create();
    component.form.setValue({
      name: 'n'.repeat(101),
      email: `${'a'.repeat(246)}@example.com`,
      role: 'USER',
    });
    component.submit();
    expect(component.form.controls.name.hasError('maxlength')).toBe(true);
    expect(component.form.controls.email.hasError('maxlength')).toBe(true);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('submits only trimmed name, email, and role', () => {
    const { component, updateUser, close } = create();
    component.form.setValue({
      name: '  Updated User  ',
      email: 'updated@example.com',
      role: 'INSTRUCTOR',
    });

    component.submit();

    expect(updateUser).toHaveBeenCalledWith(user.id, updateRequest);
    expect(Object.keys(updateUser.mock.calls[0][1])).toEqual(['name', 'email', 'role']);
    expect(close).toHaveBeenCalledWith(updatedUser);
  });

  it('blocks duplicate submits and dialog dismissal while saving', () => {
    const pending = new Subject<AppUser>();
    const { fixture, component, updateUser, close, dialogRef } = create();
    updateUser.mockReturnValue(pending);
    component.form.setValue(updateRequest);

    component.submit();
    component.submit();
    component.close();
    fixture.detectChanges();

    expect(updateUser).toHaveBeenCalledOnce();
    expect(component.submitting()).toBe(true);
    expect(dialogRef.disableClose).toBe(true);
    expect(close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Saving');
  });

  it('shows a safe duplicate-email message for 409', () => {
    const { component, updateUser, dialogRef } = create();
    updateUser.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { detail: 'raw database constraint details' },
          }),
      ),
    );
    component.form.setValue(updateRequest);
    component.submit();
    expect(component.submissionError()).toBe('A user with this email already exists.');
    expect(component.submissionError()).not.toContain('constraint');
    expect(component.submitting()).toBe(false);
    expect(dialogRef.disableClose).toBe(false);
  });

  it('locks the current ADMIN role and maps the backend self-demotion rejection safely', () => {
    const currentAdmin = { ...user, id: 1, role: 'ADMIN' as const };
    const { component, updateUser } = create({ user: currentAdmin, editingCurrentAdmin: true });
    expect(component.form.controls.role.disabled).toBe(true);
    expect(component.form.getRawValue().role).toBe('ADMIN');

    updateUser.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { detail: 'You cannot change your own ADMIN role' },
          }),
      ),
    );
    component.form.patchValue({ name: 'Current Admin' });
    component.submit();
    expect(component.submissionError()).toBe('You cannot change your own ADMIN role.');
  });
});

const user: AppUser = {
  id: 4,
  name: 'Learner One',
  email: 'learner@example.com',
  role: 'USER',
  enabled: true,
};
const updateRequest: AdminUserUpdateRequest = {
  name: 'Updated User',
  email: 'updated@example.com',
  role: 'INSTRUCTOR',
};
const updatedUser: AppUser = { id: user.id, enabled: true, ...updateRequest };
