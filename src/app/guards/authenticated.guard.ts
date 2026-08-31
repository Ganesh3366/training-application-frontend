import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { map, Observable } from 'rxjs';
import { AppUser } from '../models/app.models';
import { AuthService } from '../services/auth';

export const authenticatedGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const courseId = Number(route.paramMap.get('courseId'));
  const fallback = router.createUrlTree(
    Number.isInteger(courseId) && courseId > 0 ? ['/courses', courseId] : ['/courses'],
    {
      queryParams: {
        login: 'required',
        returnUrl: state.url,
      },
    },
  );
  const allowAuthenticated = (user: AppUser | null): boolean | UrlTree => (user ? true : fallback);

  if (auth.authResolved()) return allowAuthenticated(auth.currentUser());
  return auth.loadCurrentUser().pipe(map(allowAuthenticated));
};
