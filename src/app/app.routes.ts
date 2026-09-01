import { Routes } from '@angular/router';
import { managementRoleGuard } from './guards/management-role.guard';
import { authenticatedGuard } from './guards/authenticated.guard';
import { adminRoleGuard } from './guards/admin-role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'courses',
        loadComponent: () => import('./pages/courses/courses').then((m) => m.Courses),
      },
      {
        path: 'courses/:courseId/certificate',
        canActivate: [authenticatedGuard],
        loadComponent: () =>
          import('./pages/certificate/certificate').then((m) => m.CertificateComponent),
      },
      {
        path: 'courses/:id',
        loadComponent: () =>
          import('./pages/course-details/course-details').then((m) => m.CourseDetails),
      },
      {
        path: 'courses/:courseId/modules/:moduleId',
        canActivate: [authenticatedGuard],
        loadComponent: () =>
          import('./pages/module-learning/module-learning').then((m) => m.ModuleLearning),
      },
      {
        path: 'admin/users',
        canActivate: [adminRoleGuard],
        loadComponent: () =>
          import('./pages/admin-user-management/admin-user-management').then(
            (m) => m.AdminUserManagementComponent,
          ),
      },
      {
        path: 'management/courses',
        canActivate: [managementRoleGuard],
        loadComponent: () =>
          import('./pages/course-management/course-management').then(
            (m) => m.CourseManagementComponent,
          ),
      },
      {
        path: 'management/reports',
        canActivate: [managementRoleGuard],
        loadComponent: () =>
          import('./pages/learner-progress-report/learner-progress-report').then(
            (m) => m.LearnerProgressReportComponent,
          ),
      },
      {
        path: 'management/courses/:courseId/modules',
        canActivate: [managementRoleGuard],
        loadComponent: () =>
          import('./pages/module-content-management/module-content-management').then(
            (m) => m.ModuleContentManagementComponent,
          ),
      },
      {
        path: 'management/courses/:courseId/modules/:moduleId/quiz',
        canActivate: [managementRoleGuard],
        loadComponent: () =>
          import('./pages/quiz-management/quiz-management').then((m) => m.QuizManagementComponent),
      },
      {
        path: 'certification',
        loadComponent: () =>
          import('./pages/certification/certification').then((m) => m.Certification),
      },
    ],
  },
];
