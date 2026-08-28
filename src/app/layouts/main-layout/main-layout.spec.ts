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

  beforeEach(() => {
    currentUser = signal<AppUser | null>(null);
    dialogOpen = vi.fn();
    logout = vi.fn(() => of(undefined).pipe(tap(() => currentUser.set(null))));
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
            loadCurrentUser: vi.fn(() => of(null)),
            logout,
          },
        },
      ],
    });
    dialogOpen = vi.spyOn(TestBed.inject(MatDialog), 'open')
      .mockReturnValue({} as MatDialogRef<AuthDialog>);
    fixture = TestBed.createComponent(MainLayout);
    fixture.detectChanges();
  });

  it('opens the existing login dialog', () => {
    const componentDialog = (fixture.componentInstance as unknown as { dialog: MatDialog }).dialog;
    dialogOpen = vi.spyOn(componentDialog, 'open').mockReturnValue({} as MatDialogRef<AuthDialog>);
    expect(fixture.nativeElement.querySelector('.login-button')).not.toBeNull();
    fixture.componentInstance.openLoginDialog();
    expect(dialogOpen).toHaveBeenCalledWith(AuthDialog, expect.objectContaining({ data: { mode: 'login' } }));
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
});

const user: AppUser = { id: 1, name: 'Ganesh', email: 'ganesh@example.com', role: 'USER' };
