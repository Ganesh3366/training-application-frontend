import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { Course, CourseModule } from '../../models/app.models';
import { CourseService } from '../../services/course';
import { CourseDetails } from './course-details';

describe('CourseDetails', () => {
  function create(courseResponse: Observable<Course>, moduleResponse: Observable<CourseModule[]>): ComponentFixture<CourseDetails> {
    TestBed.configureTestingModule({
      imports: [CourseDetails],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '3' }) } } },
        { provide: CourseService, useValue: { getCourseById: () => courseResponse, getModules: () => moduleResponse } },
      ],
    });
    const fixture = TestBed.createComponent(CourseDetails);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('displays the real course and module summaries', () => {
    const modules: CourseModule[] = [{ id: 9, title: 'HTTP Basics', description: 'Requests and responses', position: 1 }];
    const text = create(of(course), of(modules)).nativeElement.textContent;
    expect(text).toContain('Backend Integration');
    expect(text).toContain('HTTP Basics');
    expect(text).toContain('Requests and responses');
  });

  it('displays not found for a 404', () => {
    const error = new HttpErrorResponse({ status: 404 });
    expect(create(throwError(() => error), of([])).nativeElement.textContent).toContain('Course not found.');
  });

  it('displays a safe general API error', () => {
    const error = new HttpErrorResponse({ status: 500 });
    expect(create(throwError(() => error), of([])).nativeElement.textContent).toContain('Unable to load course.');
  });
});

const course: Course = {
  id: 3, title: 'Backend Integration', description: 'Use APIs', instructor: 'Grace', duration: 6,
  level: 'Intermediate', category: 'Information Technology (IT)',
};
