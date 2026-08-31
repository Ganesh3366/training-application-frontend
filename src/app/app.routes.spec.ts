import { managementRoleGuard } from './guards/management-role.guard';
import { adminRoleGuard } from './guards/admin-role.guard';
import { authenticatedGuard } from './guards/authenticated.guard';
import { routes } from './app.routes';

describe('application routes', () => {
  it.each(['courses', 'courses/:id'])('keeps %s public', (path) => {
    const route = routes[0].children?.find((item) => item.path === path);
    expect(route).toBeDefined();
    expect(route?.canActivate).toBeUndefined();
  });

  it('protects learner modules with the authenticated guard', () => {
    const route = routes[0].children?.find(
      (item) => item.path === 'courses/:courseId/modules/:moduleId',
    );
    expect(route).toBeDefined();
    expect(route?.canActivate).toEqual([authenticatedGuard]);
  });

  it('keeps certificates protected with the authenticated guard', () => {
    const route = routes[0].children?.find((item) => item.path === 'courses/:courseId/certificate');
    expect(route).toBeDefined();
    expect(route?.canActivate).toEqual([authenticatedGuard]);
  });

  it('keeps How It Works on the homepage instead of defining a separate route', () => {
    const route = routes[0].children?.find((item) => item.path === 'how-it-works');
    expect(route).toBeUndefined();
  });

  it('protects admin user assignments with the dedicated admin guard', () => {
    const route = routes[0].children?.find((item) => item.path === 'admin/users');
    expect(route).toBeDefined();
    expect(route?.canActivate).toEqual([adminRoleGuard]);
    expect(route?.canActivate).not.toContain(managementRoleGuard);
  });

  it('protects module and content management with the existing management role guard', () => {
    const route = routes[0].children?.find(
      (item) => item.path === 'management/courses/:courseId/modules',
    );
    expect(route).toBeDefined();
    expect(route?.canActivate).toEqual([managementRoleGuard]);
  });
  it('protects the separate quiz management route with the existing guard', () => {
    const route = routes[0].children?.find(
      (item) => item.path === 'management/courses/:courseId/modules/:moduleId/quiz',
    );
    expect(route).toBeDefined();
    expect(route?.canActivate).toEqual([managementRoleGuard]);
  });
});
