import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Course, CourseModule } from '../../models/app.models';
import { CourseService } from '../../services/course';

@Component({
  selector: 'app-course-details',
  standalone: true,
  template: `
    <div class="course-details">
      @if (loading()) {
        <section><p role="status">Loading course...</p></section>
      } @else if (errorMessage()) {
        <section>
          <h1>{{ errorMessage() }}</h1>
          @if (notFound()) { <p>The requested course does not exist.</p> }
        </section>
      } @else if (course(); as selectedCourse) {
        <section>
          <h1>{{ selectedCourse.title }}</h1>
          <p>{{ selectedCourse.description }}</p>
          <p><strong>Instructor:</strong> {{ selectedCourse.instructor }}</p>
          <p><strong>Level:</strong> {{ selectedCourse.level }}</p>
          <p><strong>Duration:</strong> {{ selectedCourse.duration }} hours</p>
          <h2>Modules</h2>
          @if (modules().length === 0) {
            <p>No modules are available yet.</p>
          } @else {
            <ol class="module-list">
              @for (module of modules(); track module.id) {
                <li>
                  <h3>{{ module.title }}</h3>
                  @if (module.description) { <p>{{ module.description }}</p> }
                </li>
              }
            </ol>
          }
        </section>
      }
    </div>
  `,
  styles: `
    :host { display: block; background: #f6f9ff; }
    .course-details { max-width: 900px; margin: 0 auto; padding: 36px; }
    section { padding: 28px; border: 1px solid #dce7f5; border-radius: 14px; background: #fff; box-shadow: 0 12px 32px rgba(19, 61, 112, 0.09); }
    h1, h2, h3 { color: #06183a; }
    h1 { margin-top: 0; }
    h2 { margin-top: 28px; }
    p { color: #536073; line-height: 1.5; }
    .module-list { padding-left: 24px; }
    .module-list li { padding: 10px 0; border-top: 1px solid #e3ebf5; }
    .module-list h3 { margin: 0; font-size: 16px; }
    .module-list p { margin-bottom: 0; }
    @media (max-width: 640px) { .course-details { padding: 22px 18px; } section { padding: 20px; } }
  `,
})
export class CourseDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  readonly course = signal<Course | null>(null);
  readonly modules = signal<CourseModule[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly notFound = signal(false);

  constructor() {
    const courseId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(courseId) || courseId <= 0) {
      this.showNotFound();
      return;
    }

    forkJoin({
      course: this.courseService.getCourseById(courseId),
      modules: this.courseService.getModules(courseId),
    }).subscribe({
      next: ({ course, modules }) => {
        this.course.set(course);
        this.modules.set(modules);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) this.showNotFound();
        else {
          this.errorMessage.set('Unable to load course.');
          this.loading.set(false);
        }
      },
    });
  }

  private showNotFound(): void {
    this.notFound.set(true);
    this.errorMessage.set('Course not found.');
    this.loading.set(false);
  }
}
