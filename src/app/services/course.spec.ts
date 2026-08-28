import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Course, CourseModule, CourseModuleDetail } from '../models/app.models';
import { CourseService } from './course';

describe('CourseService', () => {
  let service: CourseService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CourseService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets all courses', () => {
    const courses: Course[] = [course];
    service.getCourses().subscribe((result) => expect(result).toEqual(courses));
    const request = http.expectOne('/api/courses');
    expect(request.request.method).toBe('GET');
    request.flush(courses);
  });

  it('gets a course by id', () => {
    service.getCourseById(7).subscribe((result) => expect(result).toEqual(course));
    const request = http.expectOne('/api/courses/7');
    expect(request.request.method).toBe('GET');
    request.flush(course);
  });

  it('gets course modules', () => {
    const modules: CourseModule[] = [{ id: 2, title: 'Basics', description: null, position: 1 }];
    service.getModules(7).subscribe((result) => expect(result).toEqual(modules));
    const request = http.expectOne('/api/courses/7/modules');
    expect(request.request.method).toBe('GET');
    request.flush(modules);
  });

  it('gets a module with its contents', () => {
    const module: CourseModuleDetail = {
      id: 2, title: 'Basics', description: null, position: 1, contents: [],
    };
    service.getModule(7, 2).subscribe((result) => expect(result).toEqual(module));
    const request = http.expectOne('/api/courses/7/modules/2');
    expect(request.request.method).toBe('GET');
    request.flush(module);
  });
});

const course: Course = {
  id: 7,
  title: 'API Course',
  description: 'From the backend',
  instructor: 'Ada',
  duration: 8,
  level: 'Beginner',
  category: 'Business',
};
