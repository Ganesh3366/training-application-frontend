import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of, tap } from 'rxjs';
import { AppUser } from '../../models/app.models';
import { AuthService } from '../../services/auth';
import { AuthDialog } from '../../shared/auth-dialog/auth-dialog';
import { MainLayout } from './main-layout';

describe('MainLayout authentication', () => {
  let fixture: ComponentFixture<MainLayout>;
  let currentUser: ReturnType<typeof signal<AppUser | null>>;
  let dialogOpen: ReturnType<typeof vi.fn>;
  let logout: ReturnType<typeof vi.fn>;
  let authResolved: ReturnType<typeof signal<boolean>>;
  let loadCurrentUser: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    currentUser = signal<AppUser | null>(null);
    dialogOpen = vi.fn();
    logout = vi.fn(() => of(undefined).pipe(tap(() => currentUser.set(null))));
    authResolved = signal(true);
    loadCurrentUser = vi.fn(() => of(null));
    TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser,
            isLoggedIn: computed(() => currentUser() !== null),
            currentRole: computed(() => currentUser()?.role ?? null),
            authResolved,
            loadCurrentUser,
            logout,
          },
        },
      ],
    });
    dialogOpen.mockReturnValue({} as MatDialogRef<AuthDialog>);
    TestBed.overrideComponent(MainLayout, {
      add: { providers: [{ provide: MatDialog, useValue: { open: dialogOpen } }] },
    });
    fixture = TestBed.createComponent(MainLayout);
    fixture.detectChanges();
  });

  it('opens the existing login dialog', () => {
    expect(fixture.nativeElement.querySelector('.login-button')).not.toBeNull();
    fixture.componentInstance.openLoginDialog();
    expect(dialogOpen).toHaveBeenCalledWith(
      AuthDialog,
      expect.objectContaining({ data: { mode: 'login' } }),
    );
  });

  it('shows the authenticated user and exposes a logout action', () => {
    currentUser.set(user);
    fixture.componentInstance.isMobileMenuOpen.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ganesh');
    expect(fixture.nativeElement.textContent).toContain('Sign out');
  });

  it('updates the header after logout', () => {
    currentUser.set(user);
    fixture.detectChanges();
    fixture.componentInstance.logout();
    fixture.detectChanges();
    expect(logout).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelector('.login-button')).not.toBeNull();
  });

  it.each(['ADMIN', 'INSTRUCTOR'] as const)(
    'shows desktop and mobile management links to %s',
    (role) => {
      currentUser.set({ ...user, role });
      fixture.componentInstance.isMobileMenuOpen.set(true);
      fixture.detectChanges();
      expect(fixture.componentInstance.canManageCourses()).toBe(true);
      expect(
        fixture.nativeElement.querySelector('.desktop-nav a[href="/management/courses"]'),
      ).not.toBeNull();
      expect(
        fixture.nativeElement.querySelector('.mobile-nav a[href="/management/courses"]'),
      ).not.toBeNull();
    },
  );

  it('does not show course management navigation to USER', () => {
    currentUser.set(user);
    fixture.componentInstance.isMobileMenuOpen.set(true);
    fixture.detectChanges();
    expect(fixture.componentInstance.canManageCourses()).toBe(false);
    expect(fixture.nativeElement.querySelector('a[href="/management/courses"]')).toBeNull();
  });

  it('shows desktop and mobile Admin Users links only to ADMIN', () => {
    currentUser.set({ ...user, role: 'ADMIN' });
    fixture.componentInstance.isMobileMenuOpen.set(true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.desktop-nav a[href="/admin/users"]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('.mobile-nav a[href="/admin/users"]'),
    ).not.toBeNull();
  });

  it.each(['USER', 'INSTRUCTOR'] as const)('hides Admin Users links from %s', (role) => {
    currentUser.set({ ...user, role });
    fixture.componentInstance.isMobileMenuOpen.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a[href="/admin/users"]')).toBeNull();
  });

  it('does not restore authentication again when it is already resolved', () => {
    expect(loadCurrentUser).not.toHaveBeenCalled();
  });

  it('restores unresolved authentication exactly once', () => {
    authResolved.set(false);
    const unresolvedFixture = TestBed.createComponent(MainLayout);
    unresolvedFixture.detectChanges();
    expect(loadCurrentUser).toHaveBeenCalledOnce();
  });

  it('exposes the mobile menu state and controlled navigation id', () => {
    const toggle = fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe('mobile-navigation');
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('#mobile-navigation')).not.toBeNull();
  });
});

const user: AppUser = { id: 1, name: 'Ganesh', email: 'ganesh@example.com', role: 'USER' };
