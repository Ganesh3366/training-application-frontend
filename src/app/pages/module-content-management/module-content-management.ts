import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { CourseManagementResponse, CourseModule, ModuleContent } from '../../models/app.models';
import { CourseManagementService } from '../../services/course-management';
import { CourseModuleManagementService } from '../../services/course-module-management';
import {
  ConfirmDeleteDialogData,
  ConfirmManagementDeleteDialog,
} from './confirm-delete-dialog/confirm-delete-dialog';
import { ContentFormComponent, ContentFormDialogData } from './content-form/content-form';
import { ModuleFormComponent, ModuleFormDialogData } from './module-form/module-form';

interface ModulesLoadResult {
  modules: CourseModule[];
  contents: ReadonlyMap<number, ModuleContent[]>;
}

@Component({
  selector: 'app-module-content-management',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './module-content-management.html',
  styleUrl: './module-content-management.css',
})
export class ModuleContentManagementComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly courseManagement = inject(CourseManagementService);
  private readonly moduleManagement = inject(CourseModuleManagementService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly courseId = Number(this.route.snapshot.paramMap.get('courseId'));
  readonly course = signal<CourseManagementResponse | null>(null);
  readonly modules = signal<CourseModule[]>([]);
  readonly contents = signal<ReadonlyMap<number, ModuleContent[]>>(new Map());
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly deletingKey = signal<string | null>(null);
  readonly invalidCourseId = !Number.isInteger(this.courseId) || this.courseId <= 0;

  constructor() {
    this.loadPage();
  }

  loadPage(): void {
    if (this.invalidCourseId) {
      this.loadError.set('The module management link contains an invalid course ID.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.loadError.set(null);
    forkJoin({
      course: this.courseManagement.getCourse(this.courseId),
      moduleData: this.moduleManagement
        .getModules(this.courseId)
        .pipe(switchMap((modules) => this.loadContents(modules))),
    }).subscribe({
      next: ({ course, moduleData }) => {
        this.course.set(course);
        this.modules.set(moduleData.modules);
        this.contents.set(moduleData.contents);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loadError.set(this.loadErrorMessage(error));
        this.loading.set(false);
      },
    });
  }

  contentsFor(moduleId: number): ModuleContent[] {
    return this.contents().get(moduleId) ?? [];
  }

  openModuleForm(module: CourseModule | null): void {
    this.actionError.set(null);
    const ref = this.dialog.open<ModuleFormComponent, ModuleFormDialogData, CourseModule>(
      ModuleFormComponent,
      {
        data: { courseId: this.courseId, module },
        width: '620px',
        maxWidth: 'calc(100vw - 24px)',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      },
    );
    ref.afterClosed().subscribe((saved) => {
      if (!saved) return;
      this.modules.update((modules) =>
        this.sorted(
          module
            ? modules.map((item) => (item.id === saved.id ? saved : item))
            : [...modules, saved],
        ),
      );
      if (!module) this.contents.update((contents) => new Map(contents).set(saved.id, []));
      this.success(module ? 'Module updated.' : 'Module added.');
    });
  }

  openContentForm(moduleId: number, content: ModuleContent | null): void {
    this.actionError.set(null);
    const ref = this.dialog.open<ContentFormComponent, ContentFormDialogData, ModuleContent>(
      ContentFormComponent,
      {
        data: { courseId: this.courseId, moduleId, content },
        width: '700px',
        maxWidth: 'calc(100vw - 24px)',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      },
    );
    ref.afterClosed().subscribe((saved) => {
      if (!saved) return;
      this.contents.update((all) => {
        const next = new Map(all);
        const current = next.get(moduleId) ?? [];
        next.set(
          moduleId,
          this.sorted(
            content
              ? current.map((item) => (item.id === saved.id ? saved : item))
              : [...current, saved],
          ),
        );
        return next;
      });
      this.success(content ? 'Content updated.' : 'Content added.');
    });
  }

  confirmModuleDelete(module: CourseModule): void {
    this.confirmDelete({ kind: 'module', name: module.title }, () => this.deleteModule(module));
  }

  confirmContentDelete(moduleId: number, content: ModuleContent): void {
    this.confirmDelete({ kind: 'content', name: content.title }, () =>
      this.deleteContent(moduleId, content),
    );
  }

  contentPreview(content: ModuleContent): string {
    return content.type === 'TEXT' ? (content.textContent ?? '') : (content.videoUrl ?? '');
  }

  private loadContents(modules: CourseModule[]) {
    const ordered = this.sorted(modules);
    if (!ordered.length) return of<ModulesLoadResult>({ modules: ordered, contents: new Map() });
    return forkJoin(
      ordered.map((module) =>
        this.moduleManagement
          .getContents(this.courseId, module.id)
          .pipe(map((contents) => [module.id, this.sorted(contents)] as const)),
      ),
    ).pipe(map((entries) => ({ modules: ordered, contents: new Map(entries) })));
  }

  private confirmDelete(data: ConfirmDeleteDialogData, action: () => void): void {
    this.actionError.set(null);
    const ref = this.dialog.open<ConfirmManagementDeleteDialog, ConfirmDeleteDialogData, boolean>(
      ConfirmManagementDeleteDialog,
      {
        data,
        width: '470px',
        maxWidth: 'calc(100vw - 32px)',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      },
    );
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) action();
    });
  }

  private deleteModule(module: CourseModule): void {
    if (this.deletingKey()) return;
    this.deletingKey.set(`module-${module.id}`);
    this.moduleManagement.deleteModule(this.courseId, module.id).subscribe({
      next: () => {
        this.modules.update((modules) => modules.filter((item) => item.id !== module.id));
        this.contents.update((contents) => {
          const next = new Map(contents);
          next.delete(module.id);
          return next;
        });
        this.deletingKey.set(null);
        this.success('Module deleted.');
      },
      error: (error: HttpErrorResponse) => {
        this.actionError.set(this.deleteErrorMessage('module', error));
        this.deletingKey.set(null);
      },
    });
  }

  private deleteContent(moduleId: number, content: ModuleContent): void {
    if (this.deletingKey()) return;
    this.deletingKey.set(`content-${content.id}`);
    this.moduleManagement.deleteContent(this.courseId, moduleId, content.id).subscribe({
      next: () => {
        this.contents.update((contents) => {
          const next = new Map(contents);
          next.set(
            moduleId,
            (next.get(moduleId) ?? []).filter((item) => item.id !== content.id),
          );
          return next;
        });
        this.deletingKey.set(null);
        this.success('Content deleted.');
      },
      error: (error: HttpErrorResponse) => {
        this.actionError.set(this.deleteErrorMessage('content', error));
        this.deletingKey.set(null);
      },
    });
  }

  private sorted<T extends { position: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => a.position - b.position);
  }
  private success(message: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 3500 });
  }

  private loadErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 403)
      return 'You do not have permission to manage modules for this course.';
    if (error.status === 404) return 'The course or one of its modules no longer exists.';
    if (error.status === 0)
      return 'Unable to reach SkillForge. Check your connection and try again.';
    return 'Unable to load module management. Please try again.';
  }

  private deleteErrorMessage(kind: 'module' | 'content', error: HttpErrorResponse): string {
    if (kind === 'module' && error.status === 409)
      return 'This module cannot be deleted because it has a quiz or learner progress.';
    if (error.status === 403) return `You do not have permission to delete this ${kind}.`;
    if (error.status === 404) return `This ${kind} no longer exists.`;
    if (error.status === 0)
      return 'Unable to reach SkillForge. Check your connection and try again.';
    return `Unable to delete the ${kind}. Please try again.`;
  }
}
