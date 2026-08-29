import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Course, CourseModule, CourseProgress } from '../../models/app.models';
import { AuthService } from '../../services/auth';
import { CourseService } from '../../services/course';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [RouterLink],
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
          @if (isLoggedIn()) {
            <div class="course-progress" aria-labelledby="course-progress-heading">
              <h2 id="course-progress-heading">Course Progress</h2>
              @if (progressLoading()) {
                <p role="status">Loading progress...</p>
              } @else if (progressError()) {
                <p role="status">{{ progressError() }}</p>
              } @else if (progress(); as courseProgress) {
                <p>{{ courseProgress.completedModules }} of {{ courseProgress.totalModules }} modules completed</p>
              }
            </div>
          }
          <h2>Modules</h2>
          @if (modules().length === 0) {
            <p>No modules are available yet.</p>
          } @else {
            <a class="start-learning" [routerLink]="['/courses', courseId, 'modules', modules()[0].id]">Start Learning</a>
            <ol class="module-list">
              @for (module of modules(); track module.id) {
                <li>
                  <h3>{{ module.title }}</h3>
                  @if (module.description) { <p>{{ module.description }}</p> }
                  @if (isLoggedIn() && progress()) {
                    <p class="module-status">
                      <strong>Status:</strong>
                      <span
                        class="status-badge"
                        [class.status-completed]="moduleStatus(module.id) === 'Completed'"
                        [class.status-pending]="moduleStatus(module.id) === 'Pending'"
                      >{{ moduleStatus(module.id) }}</span>
                    </p>
                  }
                  <a [routerLink]="['/courses', courseId, 'modules', module.id]">Open Module</a>
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
    .course-progress { margin-top: 28px; padding: 16px 18px; border-radius: 10px; background: #f6f9ff; }
    .course-progress h2 { margin: 0; font-size: 20px; }
    .course-progress p { margin-bottom: 0; }
    .module-status { margin: 6px 0; }
    .status-badge { display: inline-block; margin-left: 6px; padding: 4px 10px; border-radius: 999px; font-size: 13px; font-weight: 700; }
    .status-completed { color: #1b5e20; background: #e8f5e9; }
    .status-pending { color: #e65100; background: #fff3e0; }
    a { color: #0873db; font-weight: 700; }
    .start-learning { display: inline-block; margin-bottom: 12px; padding: 10px 16px; border-radius: 8px; color: #fff; background: #0873db; text-decoration: none; }
    @media (max-width: 640px) { .course-details { padding: 22px 18px; } section { padding: 20px; } }
  `,
})
export class CourseDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  private readonly auth = inject(AuthService);
  readonly course = signal<Course | null>(null);
  readonly modules = signal<CourseModule[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly progress = signal<CourseProgress | null>(null);
  readonly progressLoading = signal(false);
  readonly progressError = signal<string | null>(null);
  private readonly progressByModuleId = computed(() =>
    new Map(this.progress()?.modules.map((module) => [module.moduleId, module]) ?? []),
  );
  readonly courseId = Number(this.route.snapshot.paramMap.get('id'));
  private progressStateVersion = 0;

  constructor() {
    if (!Number.isInteger(this.courseId) || this.courseId <= 0) {
      this.showNotFound();
      return;
    }

    forkJoin({
      course: this.courseService.getCourseById(this.courseId),
      modules: this.courseService.getModules(this.courseId),
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

    effect(() => {
      const authResolved = this.auth.authResolved();
      const user = this.auth.currentUser();
      const version = ++this.progressStateVersion;
      this.clearProgress();

      if (authResolved && user) this.loadProgress(version);
    });
  }

  moduleStatus(moduleId: number): 'Completed' | 'Pending' {
    return this.progressByModuleId().get(moduleId)?.completed ? 'Completed' : 'Pending';
  }

  private loadProgress(version: number): void {
    this.progressLoading.set(true);
    this.courseService.getCourseProgress(this.courseId).subscribe({
      next: (progress) => {
        if (version !== this.progressStateVersion) return;
        this.progress.set(progress);
        this.progressLoading.set(false);
      },
      error: () => {
        if (version !== this.progressStateVersion) return;
        this.progressError.set('Unable to load progress.');
        this.progressLoading.set(false);
      },
    });
  }

  private clearProgress(): void {
    this.progress.set(null);
    this.progressLoading.set(false);
    this.progressError.set(null);
  }

  private showNotFound(): void {
    this.notFound.set(true);
    this.errorMessage.set('Course not found.');
    this.loading.set(false);
  }
}
