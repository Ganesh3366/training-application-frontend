import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { AppUser } from '../models/app.models';
import { AuthService } from '../services/auth';
import { managementRoleGuard } from './management-role.guard';

describe('managementRoleGuard', () => {
  function configure(user: AppUser | null, resolved = true) {
    const currentUser = signal(user);
    const authResolved = signal(resolved);
    const loadCurrentUser = vi.fn(() => of(user));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser, authResolved, loadCurrentUser } },
      ],
    });
    return { loadCurrentUser, router: TestBed.inject(Router) };
  }

  function runGuard(): boolean | UrlTree | Observable<boolean | UrlTree> {
    return TestBed.runInInjectionContext(() => managementRoleGuard({} as never, {} as never)) as
      boolean | UrlTree | Observable<boolean | UrlTree>;
  }

  function expectHomeRedirect(result: boolean | UrlTree, router: Router): void {
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  }

  it.each(['ADMIN', 'INSTRUCTOR'] as const)('allows resolved %s without restoring auth', (role) => {
    const { loadCurrentUser } = configure({ ...user, role });
    expect(runGuard()).toBe(true);
    expect(loadCurrentUser).not.toHaveBeenCalled();
  });

  it('redirects a resolved USER to the home page without restoring auth', () => {
    const { loadCurrentUser, router } = configure(user);
    expectHomeRedirect(runGuard() as UrlTree, router);
    expect(loadCurrentUser).not.toHaveBeenCalled();
  });

  it('redirects a resolved anonymous user to the home page without restoring auth', () => {
    const { loadCurrentUser, router } = configure(null);
    expectHomeRedirect(runGuard() as UrlTree, router);
    expect(loadCurrentUser).not.toHaveBeenCalled();
  });

  it('allows an ADMIN restored by unresolved authentication with one request', async () => {
    const admin = { ...user, role: 'ADMIN' as const };
    const { loadCurrentUser } = configure(admin, false);
    const result = await firstValueFrom(runGuard() as Observable<boolean | UrlTree>);
    expect(result).toBe(true);
    expect(loadCurrentUser).toHaveBeenCalledOnce();
  });

  it('redirects a null unresolved authentication result with one request', async () => {
    const { loadCurrentUser, router } = configure(null, false);
    const result = await firstValueFrom(runGuard() as Observable<boolean | UrlTree>);
    expectHomeRedirect(result, router);
    expect(loadCurrentUser).toHaveBeenCalledOnce();
  });
});

const user: AppUser = { id: 1, name: 'Learner', email: 'learner@example.com', role: 'USER' };
