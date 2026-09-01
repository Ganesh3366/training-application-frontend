import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth';
import { AuthDialog, AuthDialogData, AuthDialogMode } from '../../shared/auth-dialog/auth-dialog';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.currentUser;
  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly currentRole = this.auth.currentRole;
  readonly canManageCourses = computed(() => {
    const role = this.currentRole();
    return role === 'ADMIN' || role === 'INSTRUCTOR';
  });
  readonly isMobileMenuOpen = signal(false);
  readonly logoutPending = signal(false);

  constructor() {
    if (!this.auth.authResolved()) {
      this.auth.loadCurrentUser().subscribe({ error: () => undefined });
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  navigateToHowItWorks(): void {
    void this.router.navigate(['/'], { fragment: 'how-it-works' }).then(
      () => this.scrollToHowItWorks(),
      () => undefined,
    );
  }

  openLoginDialog(): void {
    this.openAuthDialog('login');
  }

  openSignupDialog(): void {
    this.openAuthDialog('signup');
  }

  private openAuthDialog(mode: AuthDialogMode): void {
    this.closeMobileMenu();
    this.dialog.open<AuthDialog, AuthDialogData>(AuthDialog, {
      data: { mode },
      width: '480px',
      maxWidth: 'calc(100vw - 32px)',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
    });
  }

  logout(): void {
    if (this.logoutPending()) return;
    this.logoutPending.set(true);
    this.closeMobileMenu();
    this.auth.logout().subscribe({
      next: () => {
        this.logoutPending.set(false);
        void this.router.navigate(['/']).then(
          () => undefined,
          () => undefined,
        );
      },
      error: () => this.logoutPending.set(false),
    });
  }

  private scrollToHowItWorks(): void {
    requestAnimationFrame(() => {
      const section = document.getElementById('how-it-works');
      if (!section) return;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      section.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  }
}
