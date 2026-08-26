import { Injectable, signal, computed } from '@angular/core';
import { AppUser, Role } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
      private readonly storageKey = 'learnhub_user';

  readonly currentUser = signal<AppUser | null>(null);
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly currentRole = computed<Role | null>(() => this.currentUser()?.role ?? null);

  constructor() {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(this.storageKey) : null;
    if (stored) {
      try {
        this.currentUser.set(JSON.parse(stored));
      } catch {
        localStorage.removeItem(this.storageKey);
      }
    }
  }

  loginAs(role: Role): void {
    const profiles: Record<Role, AppUser> = {
      user: { name: 'Jane Learner', email: 'jane@example.com', role: 'user' },
      instructor: { name: 'Prof. Smith', email: 'smith@example.com', role: 'instructor' },
      admin: { name: 'Admin Root', email: 'admin@example.com', role: 'admin' },
    };
    const user = profiles[role];
    this.currentUser.set(user);
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(this.storageKey);
  }
}
