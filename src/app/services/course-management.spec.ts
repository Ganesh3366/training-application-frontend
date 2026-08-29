import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CourseManagementRequest, CourseManagementResponse } from '../models/app.models';
import { CourseManagementService } from './course-management';

describe('CourseManagementService', () => {
  let service: CourseManagementService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CourseManagementService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses the management API for list and detail requests', () => {
    service.getCourses().subscribe((result) => expect(result).toEqual([course]));
    const list = http.expectOne('/api/management/courses');
    expect(list.request.method).toBe('GET');
    list.flush([course]);

    service.getCourse(7).subscribe((result) => expect(result).toEqual(course));
    const detail = http.expectOne('/api/management/courses/7');
    expect(detail.request.method).toBe('GET');
    detail.flush(course);
  });

  it('sends only the approved fields when creating and updating', () => {
    service.createCourse(request).subscribe();
    const create = http.expectOne('/api/management/courses');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(request);
    expect(create.request.body).not.toHaveProperty('role');
    expect(create.request.body).not.toHaveProperty('userId');
    create.flush(course);

    service.updateCourse(7, request).subscribe();
    const update = http.expectOne('/api/management/courses/7');
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual(request);
    update.flush(course);
  });

  it('deletes using the course id', () => {
    service.deleteCourse(7).subscribe();
    const deletion = http.expectOne('/api/management/courses/7');
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null);
  });
});

const request: CourseManagementRequest = {
  title: 'Angular Basics', description: 'Learn Angular', instructor: 'Ada', duration: 8,
  level: 'BEGINNER', category: 'INFORMATION_TECHNOLOGY',
};
const course: CourseManagementResponse = { id: 7, ...request };
