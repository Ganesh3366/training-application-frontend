import { managementRoleGuard } from './guards/management-role.guard';
import { routes } from './app.routes';

describe('application routes', () => {
  it('protects module and content management with the existing management role guard', () => {
    const route = routes[0].children?.find(
      (item) => item.path === 'management/courses/:courseId/modules',
    );
    expect(route).toBeDefined();
    expect(route?.canActivate).toEqual([managementRoleGuard]);
  });
});
