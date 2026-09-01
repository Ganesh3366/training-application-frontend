import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, take } from 'rxjs';
import { Course, CourseModule, CourseProgress } from '../../models/app.models';
import { AuthService } from '../../services/auth';
import { CourseService } from '../../services/course';
import { AuthDialog, AuthDialogData } from '../../shared/auth-dialog/auth-dialog';
import { BackNavigationComponent } from '../../shared/back-navigation/back-navigation';

export function validateLocalReturnUrl(router: Router, value: string | null): string | null {
  if (!value || value[0] !== '/' || value[1] === '/') return null;

  try {
    router.parseUrl(value);
    return value;
  } catch {
    return null;
  }
}

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [RouterLink, BackNavigationComponent],
  template: `
    <div class="course-details">
      <app-back-navigation label="Back to Courses" destination="/courses" />
      @if (loading()) {
        <section><p role="status">Loading course...</p></section>
      } @else if (errorMessage()) {
        <section>
          <h1>{{ errorMessage() }}</h1>
          @if (notFound()) {
            <p>The requested course does not exist.</p>
          }
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
                <p>
                  {{ courseProgress.completedModules }} of {{ courseProgress.totalModules }} modules
                  completed
                </p>
                @if (canViewCertificate()) {
                  <a class="certificate-link" [routerLink]="['/courses', courseId, 'certificate']"
                    >View Certificate</a
                  >
                }
              }
            </div>
          }
          <h2>Modules</h2>
          @if (modules().length === 0) {
            <p>No modules are available yet.</p>
          } @else {
            <a
              class="start-learning"
              [routerLink]="['/courses', courseId, 'modules', modules()[0].id]"
              >Start Learning</a
            >
            <ol class="module-list">
              @for (module of modules(); track module.id) {
                <li>
                  <h3>{{ module.title }}</h3>
                  @if (module.description) {
                    <p>{{ module.description }}</p>
                  }
                  @if (isLoggedIn() && progress()) {
                    <p class="module-status">
                      <strong>Status:</strong>
                      <span
                        class="status-badge"
                        [class.status-completed]="moduleStatus(module.id) === 'Completed'"
                        [class.status-pending]="moduleStatus(module.id) === 'Pending'"
                        >{{ moduleStatus(module.id) }}</span
                      >
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
    :host {
      display: block;
      background: #f6f9ff;
    }
    .course-details {
      max-width: 900px;
      margin: 0 auto;
      padding: 36px;
    }
    section {
      padding: 28px;
      border: 1px solid #dce7f5;
      border-radius: 14px;
      background: #fff;
      box-shadow: 0 12px 32px rgba(19, 61, 112, 0.09);
    }
    h1,
    h2,
    h3 {
      color: #06183a;
    }
    h1 {
      margin-top: 0;
    }
    h2 {
      margin-top: 28px;
    }
    p {
      color: #536073;
      line-height: 1.5;
    }
    .module-list {
      padding-left: 24px;
    }
    .module-list li {
      padding: 10px 0;
      border-top: 1px solid #e3ebf5;
    }
    .module-list h3 {
      margin: 0;
      font-size: 16px;
    }
    .module-list p {
      margin-bottom: 0;
    }
    .course-progress {
      margin-top: 28px;
      padding: 16px 18px;
      border-radius: 10px;
      background: #f6f9ff;
    }
    .course-progress h2 {
      margin: 0;
      font-size: 20px;
    }
    .course-progress p {
      margin-bottom: 0;
    }
    .certificate-link {
      display: inline-block;
      margin-top: 14px;
      padding: 10px 16px;
      border-radius: 8px;
      color: #fff;
      background: #0873db;
      text-decoration: none;
    }
    .module-status {
      margin: 6px 0;
    }
    .status-badge {
      display: inline-block;
      margin-left: 6px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
    }
    .status-completed {
      color: #1b5e20;
      background: #e8f5e9;
    }
    .status-pending {
      color: #e65100;
      background: #fff3e0;
    }
    a {
      color: #0873db;
      font-weight: 700;
    }
    .start-learning {
      display: inline-block;
      margin-bottom: 12px;
      padding: 10px 16px;
      border-radius: 8px;
      color: #fff;
      background: #0873db;
      text-decoration: none;
    }
    @media (max-width: 640px) {
      .course-details {
        padding: 22px 18px;
      }
      section {
        padding: 20px;
      }
    }
  `,
})
export class CourseDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
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
  readonly canViewCertificate = computed(() => {
    const progress = this.progress();
    return (
      this.isLoggedIn() &&
      !!progress &&
      progress.totalModules > 0 &&
      progress.completedModules === progress.totalModules
    );
  });
  private readonly progressByModuleId = computed(
    () => new Map(this.progress()?.modules.map((module) => [module.moduleId, module]) ?? []),
  );
  readonly courseId = Number(this.route.snapshot.paramMap.get('id'));
  private progressStateVersion = 0;
  private loginRequestHandled = false;
  private loginDialogOpen = false;

  constructor() {
    if (!Number.isInteger(this.courseId) || this.courseId <= 0) {
      this.showNotFound();
      return;
    }

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((queryParams) => this.handleRequiredLogin(queryParams));

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

  private handleRequiredLogin(queryParams: ParamMap): void {
    if (queryParams.get('login') !== 'required') {
      this.loginRequestHandled = false;
      return;
    }
    if (this.loginRequestHandled) return;
    this.loginRequestHandled = true;

    const returnUrl = validateLocalReturnUrl(this.router, queryParams.get('returnUrl'));
    void this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { login: null, returnUrl: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      })
      .catch(() => false);

    if (this.loginDialogOpen) return;
    this.loginDialogOpen = true;

    const dialogRef = this.dialog.open<AuthDialog, AuthDialogData>(AuthDialog, {
      data: { mode: 'login' },
      width: '480px',
      maxWidth: 'calc(100vw - 32px)',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
    });
    dialogRef
      .afterClosed()
      .pipe(
        take(1),
        finalize(() => (this.loginDialogOpen = false)),
      )
      .subscribe(() => {
        if (returnUrl && this.isLoggedIn()) {
          void this.router.navigateByUrl(returnUrl).catch(() => false);
        }
      });
  }

  private showNotFound(): void {
    this.notFound.set(true);
    this.errorMessage.set('Course not found.');
    this.loading.set(false);
  }
}
