import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AppUser } from '../models/app.models';
import { AuthService } from '../services/auth';

export const managementRoleGuard: CanActivateFn = ():
  Observable<boolean | UrlTree> | boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowManagementRole = (user: AppUser | null): boolean | UrlTree => {
    if (user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') return true;
    return router.createUrlTree(['/']);
  };

  if (auth.authResolved()) return allowManagementRole(auth.currentUser());

  return auth.loadCurrentUser().pipe(map(allowManagementRole));
};
