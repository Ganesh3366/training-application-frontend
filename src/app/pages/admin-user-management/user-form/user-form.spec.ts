import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';
import { AdminUserCreateRequest, AppUser, Role } from '../../../models/app.models';
import { AdminUserService } from '../../../services/admin-user';
import { AdminUserFormComponent } from './user-form';

describe('AdminUserFormComponent', () => {
  function create() {
    const close = vi.fn();
    const dialogRef = { close, disableClose: false };
    const createUser = vi.fn((_request: AdminUserCreateRequest) => of(createdUser));
    TestBed.configureTestingModule({
      imports: [AdminUserFormComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: AdminUserService, useValue: { createUser } },
      ],
    });
    const fixture = TestBed.createComponent(AdminUserFormComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance, createUser, close, dialogRef };
  }

  it('renders the form with recommended autocomplete behavior and exact role options', () => {
    const { fixture, component } = create();

    expect(component.roleOptions).toEqual(['USER', 'INSTRUCTOR', 'ADMIN']);
    expect(fixture.nativeElement.querySelector('[formcontrolname="firstName"]').autocomplete).toBe(
      'given-name',
    );
    expect(fixture.nativeElement.querySelector('[formcontrolname="lastName"]').autocomplete).toBe(
      'family-name',
    );
    expect(fixture.nativeElement.querySelector('[formcontrolname="email"]').autocomplete).toBe(
      'email',
    );
    const password = fixture.nativeElement.querySelector(
      '[formcontrolname="password"]',
    ) as HTMLInputElement;
    expect(password.type).toBe('password');
    expect(password.autocomplete).toBe('new-password');
  });

  it('requires every field and rejects blank names and password', () => {
    const { component, createUser } = create();
    component.form.setValue({
      firstName: ' ',
      lastName: ' ',
      email: '',
      password: '        ',
      role: null,
    });

    component.submit();

    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.firstName.hasError('whitespace')).toBe(true);
    expect(component.form.controls.lastName.hasError('whitespace')).toBe(true);
    expect(component.form.controls.password.hasError('whitespace')).toBe(true);
    expect(component.form.controls.role.hasError('required')).toBe(true);
    expect(component.form.controls.firstName.touched).toBe(true);
    expect(createUser).not.toHaveBeenCalled();
  });

  it('rejects invalid or overlong email addresses', () => {
    const { component, createUser } = create();
    component.form.setValue({ ...validForm, email: 'not-an-email' });
    component.submit();
    expect(component.form.controls.email.hasError('email')).toBe(true);

    component.form.controls.email.setValue(`${'a'.repeat(246)}@example.com`);
    component.submit();
    expect(component.form.controls.email.hasError('maxlength')).toBe(true);
    expect(createUser).not.toHaveBeenCalled();
  });

  it('enforces name and password length limits', () => {
    const { component, createUser } = create();
    component.form.setValue({
      ...validForm,
      firstName: 'a'.repeat(101),
      lastName: 'b'.repeat(101),
      password: 'short',
    });
    component.submit();
    expect(component.form.controls.firstName.hasError('maxlength')).toBe(true);
    expect(component.form.controls.lastName.hasError('maxlength')).toBe(true);
    expect(component.form.controls.password.hasError('minlength')).toBe(true);

    component.form.setValue({ ...validForm, password: 'p'.repeat(73) });
    component.submit();
    expect(component.form.controls.password.hasError('maxlength')).toBe(true);
    expect(createUser).not.toHaveBeenCalled();
  });

  it('requires one of the existing roles', () => {
    const { component, createUser } = create();
    component.form.setValue({ ...validForm, role: 'OWNER' as Role });
    component.submit();
    expect(component.form.controls.role.hasError('role')).toBe(true);
    expect(createUser).not.toHaveBeenCalled();
  });

  it('submits only the exact typed payload with trimmed names', () => {
    const { component, createUser, close } = create();
    component.form.setValue({
      ...validForm,
      firstName: '  Ada  ',
      lastName: '  Lovelace  ',
      email: 'ada@example.com',
    });

    component.submit();

    expect(createUser).toHaveBeenCalledOnce();
    expect(createUser).toHaveBeenCalledWith(createRequest);
    expect(Object.keys(createUser.mock.calls[0][0])).toEqual([
      'firstName',
      'lastName',
      'email',
      'password',
      'role',
    ]);
    expect(close).toHaveBeenCalledWith(createdUser);
  });

  it('prevents duplicate submit and dialog dismissal while creation is pending', () => {
    const pending = new Subject<AppUser>();
    const { fixture, component, createUser, close, dialogRef } = create();
    createUser.mockReturnValue(pending);
    component.form.setValue(validForm);

    component.submit();
    component.submit();
    component.close();
    fixture.detectChanges();

    expect(createUser).toHaveBeenCalledOnce();
    expect(component.submitting()).toBe(true);
    expect(dialogRef.disableClose).toBe(true);
    expect(close).not.toHaveBeenCalled();
    expect(
      (fixture.nativeElement.querySelector('.primary-action') as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Creating');
  });

  it('shows the safe duplicate-email message and restores the form after a 409', () => {
    const { component, createUser, dialogRef } = create();
    createUser.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { message: 'raw database constraint details' },
          }),
      ),
    );
    component.form.setValue(validForm);

    component.submit();

    expect(component.submissionError()).toBe('An account with this email already exists.');
    expect(component.submissionError()).not.toContain('constraint');
    expect(component.submitting()).toBe(false);
    expect(dialogRef.disableClose).toBe(false);
  });

  it.each([
    [400, 'Some user details are invalid.'],
    [403, 'You do not have permission to create users.'],
    [0, 'Unable to reach SkillForge.'],
    [500, 'Unable to create the user.'],
  ])('maps status %s to safe feedback', (status, message) => {
    const { component, createUser } = create();
    createUser.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status, error: 'sensitive server details' })),
    );
    component.form.setValue(validForm);
    component.submit();
    expect(component.submissionError()).toContain(message);
    expect(component.submissionError()).not.toContain('sensitive');
  });
});

const validForm = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  password: 'strong-password',
  role: 'INSTRUCTOR' as Role,
};

const createRequest: AdminUserCreateRequest = { ...validForm };
const createdUser: AppUser = {
  id: 12,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  role: 'INSTRUCTOR',
};
