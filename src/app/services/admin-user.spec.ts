import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppUser, CourseAssignment } from '../models/app.models';
import { AdminUserService } from './admin-user';

describe('AdminUserService', () => {
  let service: AdminUserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminUserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets users from the admin users endpoint', () => {
    service.getUsers().subscribe((result) => expect(result).toEqual([user]));
    const request = http.expectOne('/api/admin/users');
    expect(request.request.method).toBe('GET');
    request.flush([user]);
  });

  it('gets assignments for the requested user', () => {
    service.getAssignments(4).subscribe((result) => expect(result).toEqual([assignment]));
    const request = http.expectOne('/api/admin/users/4/assignments');
    expect(request.request.method).toBe('GET');
    request.flush([assignment]);
  });

  it('posts the exact course assignment payload', () => {
    service.assignCourse(4, 7).subscribe((result) => expect(result).toEqual(assignment));
    const request = http.expectOne('/api/admin/users/4/assignments');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ courseId: 7 });
    expect(Object.keys(request.request.body)).toEqual(['courseId']);
    request.flush(assignment);
  });
});

const user: AppUser = { id: 4, name: 'Learner', email: 'learner@example.com', role: 'USER' };
const assignment: CourseAssignment = {
  id: 10,
  assignedAt: '2026-08-31T10:00:00Z',
  course: {
    id: 7,
    title: 'Angular Basics',
    description: 'Learn Angular',
    instructor: 'Ada',
    duration: 8,
    level: 'BEGINNER',
    category: 'INFORMATION_TECHNOLOGY',
  },
};
