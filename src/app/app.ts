import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './services/auth';
import { NavItem } from './models/app.models';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    RouterOutlet,
  ],
})
export class App {
  private readonly auth = inject(AuthService);

  readonly currentUser = this.auth.currentUser;
  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly currentRole = this.auth.currentRole;

  readonly isMobileMenuOpen = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'Courses', path: '/courses', icon: 'school' },
    { label: 'Certification', path: '/certification', icon: 'workspace_premium' },
    { label: 'How It Works', path: '/how-it-works', icon: 'lightbulb' },
  ];

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  loginAs(role: 'user' | 'instructor' | 'admin'): void {
    this.auth.loginAs(role);
    this.closeMobileMenu();
  }

  logout(): void {
    this.auth.logout();
    this.closeMobileMenu();
  }
}
