import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { AppUser, Role } from '../models/app.models';
import { AuthService } from '../services/auth';
import { adminRoleGuard } from './admin-role.guard';

describe('adminRoleGuard', () => {
  function configure(role: Role) {
    const user: AppUser = { id: 1, name: 'Test User', email: 'user@example.com', role };
    const currentUser = signal<AppUser | null>(user);
    const authResolved = signal(true);
    const loadCurrentUser = vi.fn(() => of(user));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser, authResolved, loadCurrentUser } },
      ],
    });
    return TestBed.inject(Router);
  }

  function runGuard(): boolean | UrlTree {
    return TestBed.runInInjectionContext(() => adminRoleGuard({} as never, {} as never)) as
      boolean | UrlTree;
  }

  it('allows ADMIN', () => {
    configure('ADMIN');
    expect(runGuard()).toBe(true);
  });

  it.each(['USER', 'INSTRUCTOR'] as const)('redirects %s to the home page', (role) => {
    const router = configure(role);
    const result = runGuard();
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  });

  it('restores unresolved authentication before checking the role', async () => {
    const admin: AppUser = {
      id: 2,
      name: 'Admin',
      email: 'admin@example.com',
      role: 'ADMIN',
    };
    const authResolved = signal(false);
    const loadCurrentUser = vi.fn(() => of(admin));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { currentUser: signal<AppUser | null>(null), authResolved, loadCurrentUser },
        },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      adminRoleGuard({} as never, {} as never),
    ) as Observable<boolean | UrlTree>;
    await expect(firstValueFrom(result)).resolves.toBe(true);
    expect(loadCurrentUser).toHaveBeenCalledOnce();
  });
});
