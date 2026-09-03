import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { Course } from '../../models/app.models';
import { CourseService } from '../../services/course';
import { Courses } from './courses';

describe('Courses', () => {
  function create(response: Observable<Course[]>): ComponentFixture<Courses> {
    TestBed.configureTestingModule({
      imports: [Courses],
      providers: [
        provideRouter([]),
        { provide: CourseService, useValue: { getCourses: () => response } },
      ],
    });
    const fixture = TestBed.createComponent(Courses);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('displays API courses and derives category counts', () => {
    const fixture = create(of([course, { ...course, id: 2, title: 'Second Course' }]));
    expect(fixture.nativeElement.textContent).toContain('API Course');
    expect(fixture.nativeElement.textContent).toContain('Second Course');
    const businessCard = [...fixture.nativeElement.querySelectorAll('.category-card')].find(
      (element: Element) => element.textContent?.includes('Business'),
    );
    expect(businessCard?.textContent).toContain('2 Courses');
  });

  it('displays the empty state', () => {
    expect(create(of([])).nativeElement.textContent).toContain('No courses are available yet.');
  });

  it('displays a safe API error', () => {
    expect(create(throwError(() => new Error('secret'))).nativeElement.textContent).toContain(
      'Unable to load courses.',
    );
  });
});

const course: Course = {
  id: 1,
  title: 'API Course',
  description: 'Backend data',
  instructor: 'Ada',
  duration: 4,
  level: 'Beginner',
  category: 'Business',
};
