import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { filter, finalize, fromEvent, merge, timer } from 'rxjs';
import { CourseProgressStatus, LearnerCourseReport } from '../../models/app.models';
import { LearnerProgressReportService } from '../../services/learner-progress-report';

const REPORT_REFRESH_INTERVAL_MS = 15_000;

interface LearnerReportGroup {
  learnerId: number;
  learnerName: string;
  learnerEmail: string;
  reports: LearnerCourseReport[];
}

@Component({
  selector: 'app-learner-progress-report',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    TitleCasePipe,
  ],
  templateUrl: './learner-progress-report.html',
  styleUrl: './learner-progress-report.css',
})
export class LearnerProgressReportComponent {
  private readonly reportService = inject(LearnerProgressReportService);
  private readonly destroyRef = inject(DestroyRef);
  private requestInProgress = false;

  readonly reports = signal<LearnerCourseReport[]>([]);
  readonly learnerGroups = computed<LearnerReportGroup[]>(() => {
    const groups = new Map<number, LearnerReportGroup>();

    for (const report of this.reports()) {
      const existingGroup = groups.get(report.learnerId);
      if (existingGroup) {
        existingGroup.reports.push(report);
        continue;
      }

      groups.set(report.learnerId, {
        learnerId: report.learnerId,
        learnerName: report.learnerName,
        learnerEmail: report.learnerEmail,
        reports: [report],
      });
    }

    return Array.from(groups.values()).sort(
      (left, right) =>
        left.learnerName.localeCompare(right.learnerName) || left.learnerId - right.learnerId,
    );
  });
  readonly assignedCount = computed(
    () => this.reports().filter((report) => report.assigned).length,
  );
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);

  constructor() {
    this.loadReports();

    timer(REPORT_REFRESH_INTERVAL_MS, REPORT_REFRESH_INTERVAL_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadReports(false));

    merge(fromEvent(window, 'focus'), fromEvent(document, 'visibilitychange'))
      .pipe(
        filter(() => document.visibilityState === 'visible'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.loadReports(false));
  }

  loadReports(showFullPageLoading = true): void {
    if (this.requestInProgress) return;

    this.requestInProgress = true;
    if (showFullPageLoading) {
      this.loading.set(true);
      this.loadError.set(null);
    }

    this.reportService
      .getReports()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.requestInProgress = false)),
      )
      .subscribe({
        next: (reports) => {
          this.reports.set(reports);
          this.loadError.set(null);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          if (showFullPageLoading) {
            this.loadError.set(this.loadErrorMessage(error));
            this.loading.set(false);
          }
        },
      });
  }

  statusLabel(status: CourseProgressStatus): string {
    const labels: Record<CourseProgressStatus, string> = {
      NOT_STARTED: 'Not Started',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
    };
    return labels[status];
  }

  scoreLabel(score: number | null): string {
    return score === null ? 'Not attempted' : `${score}%`;
  }

  private loadErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 403) return 'You do not have permission to view learner progress reports.';
    if (error.status === 0) {
      return 'Unable to reach SkillForge. Check your connection and try again.';
    }
    return 'Unable to load learner progress reports. Please try again.';
  }
}
