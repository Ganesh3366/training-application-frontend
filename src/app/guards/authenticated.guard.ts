import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AppUser } from '../models/app.models';
import { AuthService } from '../services/auth';

export const authenticatedGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const courseId = Number(route.paramMap.get('courseId'));
  const fallback =
    Number.isInteger(courseId) && courseId > 0
      ? router.createUrlTree(['/courses', courseId])
      : router.createUrlTree(['/courses']);
  const allowAuthenticated = (user: AppUser | null): boolean | UrlTree => (user ? true : fallback);

  if (auth.authResolved()) return allowAuthenticated(auth.currentUser());
  return auth.loadCurrentUser().pipe(map(allowAuthenticated));
};
