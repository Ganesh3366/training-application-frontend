import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, of, Subject, throwError } from 'rxjs';
import { AppUser, LoginRequest, SignupRequest } from '../../models/app.models';
import { AuthService } from '../../services/auth';
import { AuthDialog, AuthDialogMode } from './auth-dialog';

describe('AuthDialog', () => {
  function create(
    mode: AuthDialogMode,
    login: (request: LoginRequest) => Observable<AppUser> = () => of(user),
    signup: (request: SignupRequest) => Observable<AppUser> = () => of(user),
  ): { fixture: ComponentFixture<AuthDialog>; close: ReturnType<typeof vi.fn> } {
    const close = vi.fn();
    TestBed.configureTestingModule({
      imports: [AuthDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { mode } },
        { provide: MatDialogRef, useValue: { close } },
        { provide: AuthService, useValue: { login, signup } },
      ],
    });
    const fixture = TestBed.createComponent(AuthDialog);
    fixture.detectChanges();
    return { fixture, close };
  }

  afterEach(() => TestBed.resetTestingModule());

  it('submits a valid login once and prevents duplicates while pending', () => {
    const pending = new Subject<AppUser>();
    const login = vi.fn(() => pending.asObservable());
    const { fixture, close } = create('login', login);
    fixture.componentInstance.loginForm.setValue({ email: user.email, password: 'secret123' });
    fixture.componentInstance.submit();
    fixture.componentInstance.submit();
    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith({ email: user.email, password: 'secret123' });
    pending.next(user);
    pending.complete();
    expect(close).toHaveBeenCalledOnce();
  });

  it('shows an accessible generic invalid-login error', () => {
    const { fixture } = create('login', () => throwError(() => new HttpErrorResponse({ status: 401 })));
    fixture.componentInstance.loginForm.setValue({ email: user.email, password: 'wrongpass' });
    fixture.componentInstance.submit();
    fixture.detectChanges();
    const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
    expect(alert.textContent).toContain('Unable to log in. Check your email and password and try again.');
  });

  it('signs up with only name, email, and password and switches to login', () => {
    const signup = vi.fn(() => of(user));
    const { fixture } = create('signup', () => of(user), signup);
    fixture.componentInstance.signupForm.setValue({
      firstName: 'Ganesh', lastName: 'Kumar', email: user.email, password: 'SecurePass123!',
    });
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(signup).toHaveBeenCalledWith({
      name: 'Ganesh Kumar', email: user.email, password: 'SecurePass123!',
    });
    expect(fixture.componentInstance.activeMode()).toBe('login');
    expect(fixture.nativeElement.textContent).toContain('Account created. You can now log in.');
  });

  it('shows a useful accessible duplicate-signup error', () => {
    const duplicate = new HttpErrorResponse({ status: 409 });
    const { fixture } = create('signup', () => of(user), () => throwError(() => duplicate));
    fixture.componentInstance.signupForm.setValue({
      firstName: 'Ganesh', lastName: 'Kumar', email: user.email, password: 'SecurePass123!',
    });
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
      .toContain('An account with this email already exists.');
  });
});

const user: AppUser = { id: 1, name: 'Ganesh', email: 'ganesh@example.com', role: 'USER', enabled: true };
