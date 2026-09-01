import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppUser, CsrfTokenResponse, LoginRequest, SignupRequest } from '../models/app.models';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('logs in, initializes CSRF, and stores the safe user in memory', () => {
    const request: LoginRequest = { email: 'ganesh@example.com', password: 'SecurePass123!' };
    service.login(request).subscribe((result) => expect(result).toEqual(user));

    const login = http.expectOne('/api/auth/login');
    expect(login.request.method).toBe('POST');
    expect(login.request.body).toEqual(request);
    login.flush(user);
    http.expectOne('/api/auth/csrf').flush(csrf);
    expect(service.currentUser()).toEqual(user);
  });

  it('signs up without a role field', () => {
    const request: SignupRequest = { name: 'Ganesh', email: 'ganesh@example.com', password: 'SecurePass123!' };
    service.signup(request).subscribe((result) => expect(result).toEqual(user));
    const signup = http.expectOne('/api/auth/signup');
    expect(signup.request.method).toBe('POST');
    expect(signup.request.body).toEqual(request);
    expect(signup.request.body).not.toHaveProperty('role');
    signup.flush(user);
  });

  it('restores an authenticated user and shares one me request', () => {
    expect(service.authResolved()).toBe(false);
    service.loadCurrentUser().subscribe();
    service.loadCurrentUser().subscribe();
    const me = http.expectOne('/api/auth/me');
    me.flush(user);
    expect(service.currentUser()).toEqual(user);
    expect(service.authResolved()).toBe(true);
  });

  it('performs a fresh me request after an unauthenticated result completes', () => {
    service.loadCurrentUser().subscribe();
    http.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });

    service.loadCurrentUser().subscribe((result) => expect(result).toEqual(user));
    http.expectOne('/api/auth/me').flush(user);
  });

  it('does not reuse stale me data after login changes the current user', () => {
    service.loadCurrentUser().subscribe();
    http.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });

    service.login({ email: user.email, password: 'SecurePass123!' }).subscribe();
    http.expectOne('/api/auth/login').flush(user);
    http.expectOne('/api/auth/csrf').flush(csrf);

    service.loadCurrentUser().subscribe();
    http.expectOne('/api/auth/me').flush(user);
  });

  it('does not reuse stale authenticated me data after logout', () => {
    service.loadCurrentUser().subscribe();
    http.expectOne('/api/auth/me').flush(user);

    service.logout().subscribe();
    http.expectOne('/api/auth/csrf').flush(csrf);
    http.expectOne('/api/auth/logout').flush(null);
    expect(service.currentUser()).toBeNull();
    expect(service.authResolved()).toBe(true);

    service.loadCurrentUser().subscribe();
    http.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });
  });

  it('ignores an old me response after login succeeds', () => {
    service.loadCurrentUser().subscribe();
    const oldMe = http.expectOne('/api/auth/me');

    service.login({ email: user.email, password: 'SecurePass123!' }).subscribe();
    http.expectOne('/api/auth/login').flush(user);
    http.expectOne('/api/auth/csrf').flush(csrf);
    expect(service.currentUser()).toEqual(user);

    oldMe.flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(service.currentUser()).toEqual(user);
  });

  it('ignores an old me response after logout succeeds', () => {
    service.currentUser.set(user);
    service.loadCurrentUser().subscribe();
    const oldMe = http.expectOne('/api/auth/me');

    service.logout().subscribe();
    http.expectOne('/api/auth/csrf').flush(csrf);
    http.expectOne('/api/auth/logout').flush(null);
    expect(service.currentUser()).toBeNull();

    oldMe.flush(user);
    expect(service.currentUser()).toBeNull();
  });

  it('does not let an old request finalize clear a newer me request', () => {
    service.loadCurrentUser().subscribe();
    const oldMe = http.expectOne('/api/auth/me');

    service.login({ email: user.email, password: 'SecurePass123!' }).subscribe();
    http.expectOne('/api/auth/login').flush(user);
    http.expectOne('/api/auth/csrf').flush(csrf);

    service.loadCurrentUser().subscribe();
    const newMe = http.expectOne('/api/auth/me');
    oldMe.flush(null, { status: 401, statusText: 'Unauthorized' });

    service.loadCurrentUser().subscribe();
    http.expectNone('/api/auth/me');
    newMe.flush(user);
  });

  it('treats a me 401 as logged out', () => {
    let result: AppUser | null | undefined;
    service.loadCurrentUser().subscribe((value) => result = value);
    http.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(result).toBeNull();
    expect(service.currentUser()).toBeNull();
  });

  it('initializes CSRF', () => {
    service.initializeCsrf().subscribe((result) => expect(result).toEqual(csrf));
    const request = http.expectOne('/api/auth/csrf');
    expect(request.request.method).toBe('GET');
    request.flush(csrf);
  });

  it('logs out through CSRF-protected POST and clears user state', () => {
    service.currentUser.set(user);
    service.logout().subscribe();
    http.expectOne('/api/auth/csrf').flush(csrf);
    const logout = http.expectOne('/api/auth/logout');
    expect(logout.request.method).toBe('POST');
    expect(logout.request.body).toBeNull();
    logout.flush(null);
    expect(service.currentUser()).toBeNull();
  });

  it('does not persist authentication in browser storage', () => {
    const localSet = vi.spyOn(localStorage, 'setItem');
    const sessionSet = vi.spyOn(sessionStorage, 'setItem');
    service.currentUser.set(user);
    expect(localSet).not.toHaveBeenCalled();
    expect(sessionSet).not.toHaveBeenCalled();
    localSet.mockRestore();
    sessionSet.mockRestore();
  });
});

const user: AppUser = { id: 1, name: 'Ganesh', email: 'ganesh@example.com', role: 'USER', enabled: true };
const csrf: CsrfTokenResponse = {
  token: 'test-token', headerName: 'X-XSRF-TOKEN', parameterName: '_csrf',
};
