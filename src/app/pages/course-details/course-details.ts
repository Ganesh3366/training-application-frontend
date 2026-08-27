import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course';

@Component({
  selector: 'app-course-details',
  standalone: true,
  template: `
  @if (course) {
    <section>
      <h1>{{ course.title }}</h1>

      <p>{{ course.description }}</p>

      <p>
        <strong>Instructor:</strong>
        {{ course.instructor }}
      </p>

      <p>
        <strong>Level:</strong>
        {{ course.level }}
      </p>

      <p>
        <strong>Duration:</strong>
        {{ course.duration }} hours
      </p>
    </section>
  } @else {
    <section>
      <h1>Course not found</h1>
      <p>The requested course does not exist.</p>
    </section>
  }
`,
})
export class CourseDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  readonly courseId: number = Number(this.route.snapshot.paramMap.get('id'));
  readonly course = this.courseService.getCourseById(this.courseId);
}
