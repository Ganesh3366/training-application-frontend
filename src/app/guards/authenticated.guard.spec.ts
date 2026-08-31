import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { AppUser } from '../models/app.models';
import { AuthService } from '../services/auth';
import { authenticatedGuard } from './authenticated.guard';

describe('authenticatedGuard', () => {
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

  function runGuard(
    courseId = '3',
    url = '/courses/3/modules/9',
  ): boolean | UrlTree | Observable<boolean | UrlTree> {
    const route = { paramMap: convertToParamMap({ courseId }) } as ActivatedRouteSnapshot;
    const state = { url } as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => authenticatedGuard(route, state)) as
      boolean | UrlTree | Observable<boolean | UrlTree>;
  }

  it.each(['USER', 'INSTRUCTOR', 'ADMIN'] as const)(
    'allows a resolved authenticated %s',
    (role) => {
      const { loadCurrentUser } = configure({ ...user, role });
      expect(runGuard()).toBe(true);
      expect(loadCurrentUser).not.toHaveBeenCalled();
    },
  );

  it('redirects anonymous module access to the relevant course and preserves the URL', () => {
    const { loadCurrentUser, router } = configure(null);
    const result = runGuard() as UrlTree;
    expect(router.serializeUrl(result)).toBe(
      '/courses/3?login=required&returnUrl=%2Fcourses%2F3%2Fmodules%2F9',
    );
    expect(result.queryParams).toEqual({
      login: 'required',
      returnUrl: '/courses/3/modules/9',
    });
    expect(loadCurrentUser).not.toHaveBeenCalled();
  });

  it('preserves a certificate URL in the anonymous redirect', () => {
    const { router } = configure(null);
    const result = runGuard('3', '/courses/3/certificate') as UrlTree;
    expect(router.serializeUrl(result)).toBe(
      '/courses/3?login=required&returnUrl=%2Fcourses%2F3%2Fcertificate',
    );
  });

  it('restores unresolved authentication once and allows the returned user', async () => {
    const { loadCurrentUser } = configure(user, false);
    const result = await firstValueFrom(runGuard() as Observable<boolean | UrlTree>);
    expect(result).toBe(true);
    expect(loadCurrentUser).toHaveBeenCalledOnce();
  });

  it('redirects when unresolved authentication restores no user', async () => {
    const { loadCurrentUser, router } = configure(null, false);
    const result = await firstValueFrom(runGuard() as Observable<boolean | UrlTree>);
    expect(router.serializeUrl(result as UrlTree)).toBe(
      '/courses/3?login=required&returnUrl=%2Fcourses%2F3%2Fmodules%2F9',
    );
    expect(loadCurrentUser).toHaveBeenCalledOnce();
  });
});

const user: AppUser = { id: 5, name: 'Learner', email: 'learner@example.com', role: 'USER' };
