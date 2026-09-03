import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import {
  AppUser,
  CsrfTokenResponse,
  LoginRequest,
  Role,
  SignupRequest,
} from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private currentUserRequest?: Observable<AppUser | null>;
  private authStateVersion = 0;

  readonly currentUser = signal<AppUser | null>(null);
  readonly authResolved = signal(false);
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly currentRole = computed<Role | null>(() => this.currentUser()?.role ?? null);

  signup(request: SignupRequest): Observable<AppUser> {
    return this.http.post<AppUser>('/api/auth/signup', request);
  }

  login(request: LoginRequest): Observable<AppUser> {
    return this.http.post<AppUser>('/api/auth/login', request).pipe(
      switchMap((user) => this.initializeCsrf().pipe(map(() => user))),
      tap((user) => {
        this.authStateVersion++;
        this.currentUserRequest = undefined;
        this.currentUser.set(user);
        this.authResolved.set(true);
      }),
    );
  }

  loadCurrentUser(): Observable<AppUser | null> {
    if (!this.currentUserRequest) {
      const requestVersion = this.authStateVersion;
      let request: Observable<AppUser | null>;
      request = this.http.get<AppUser>('/api/auth/me').pipe(
        tap((user) => {
          if (requestVersion === this.authStateVersion) {
            this.currentUser.set(user);
            this.authResolved.set(true);
          }
        }),
        map((user) => user as AppUser | null),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            if (requestVersion === this.authStateVersion) {
              this.currentUser.set(null);
              this.authResolved.set(true);
            }
            return of(null);
          }
          return throwError(() => error);
        }),
        finalize(() => {
          if (requestVersion === this.authStateVersion) this.authResolved.set(true);
          if (this.currentUserRequest === request) this.currentUserRequest = undefined;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
      this.currentUserRequest = request;
    }
    return this.currentUserRequest;
  }

  initializeCsrf(): Observable<CsrfTokenResponse> {
    return this.http.get<CsrfTokenResponse>('/api/auth/csrf');
  }

  logout(): Observable<void> {
    return this.initializeCsrf().pipe(
      switchMap(() => this.http.post<void>('/api/auth/logout', null)),
      tap(() => {
        this.authStateVersion++;
        this.currentUserRequest = undefined;
        this.currentUser.set(null);
        this.authResolved.set(true);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authStateVersion++;
          this.currentUserRequest = undefined;
          this.currentUser.set(null);
          this.authResolved.set(true);
          return of(undefined);
        }
        return throwError(() => error);
      }),
    );
  }
}
