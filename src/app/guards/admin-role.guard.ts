import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AppUser } from '../models/app.models';
import { AuthService } from '../services/auth';

export const adminRoleGuard: CanActivateFn = ():
  Observable<boolean | UrlTree> | boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowAdmin = (user: AppUser | null): boolean | UrlTree =>
    user?.role === 'ADMIN' ? true : router.createUrlTree(['/']);

  if (auth.authResolved()) return allowAdmin(auth.currentUser());

  return auth.loadCurrentUser().pipe(map(allowAdmin));
};
