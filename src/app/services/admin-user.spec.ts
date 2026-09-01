import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  AdminUserCreateRequest,
  AdminUserUpdateRequest,
  AppUser,
  CourseAssignment,
} from '../models/app.models';
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

  it('posts the exact user creation payload to the admin users endpoint', () => {
    service.createUser(createRequest).subscribe((result) => expect(result).toEqual(user));
    const request = http.expectOne('/api/admin/users');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(createRequest);
    expect(Object.keys(request.request.body)).toEqual([
      'firstName',
      'lastName',
      'email',
      'password',
      'role',
    ]);
    request.flush(user);
  });

  it('puts the exact user update payload to the requested user endpoint', () => {
    service.updateUser(4, updateRequest).subscribe((result) => expect(result).toEqual(user));
    const request = http.expectOne('/api/admin/users/4');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(updateRequest);
    expect(Object.keys(request.request.body)).toEqual(['name', 'email', 'role']);
    request.flush(user);
  });

  it.each([
    ['deactivate', false],
    ['reactivate', true],
  ])('patches the exact enabled payload to %s a user', (_action, enabled) => {
    service.setUserEnabled(4, enabled).subscribe((result) => expect(result).toEqual(user));
    const request = http.expectOne('/api/admin/users/4/enabled');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ enabled });
    expect(Object.keys(request.request.body)).toEqual(['enabled']);
    request.flush(user);
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

const user: AppUser = {
  id: 4,
  name: 'Learner',
  email: 'learner@example.com',
  role: 'USER',
  enabled: true,
};
const createRequest: AdminUserCreateRequest = {
  firstName: 'Learner',
  lastName: 'One',
  email: 'learner@example.com',
  password: 'strong-password',
  role: 'USER',
};
const updateRequest: AdminUserUpdateRequest = {
  name: 'Updated Learner',
  email: 'updated@example.com',
  role: 'INSTRUCTOR',
};
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
