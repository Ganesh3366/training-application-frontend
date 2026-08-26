import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'courses',
    pathMatch: 'full',
  },
  {
    path: 'courses',
    loadComponent: () => import('./pages/courses/courses').then((m) => m.Courses),
  },
  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./pages/course-details/course-details').then((m) => m.CourseDetails),
  },
  {
    path: 'certification',
    loadComponent: () => import('./pages/certification/certification').then((m) => m.Certification),
  },
  {
    path: 'how-it-works',
    loadComponent: () => import('./pages/how-it-works/How-It-works').then((m) => m.HowItWorks),
  },
];
