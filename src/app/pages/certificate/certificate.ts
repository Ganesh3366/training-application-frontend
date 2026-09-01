import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Certificate } from '../../models/app.models';
import { CourseService } from '../../services/course';
import { BackNavigationComponent } from '../../shared/back-navigation/back-navigation';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink, BackNavigationComponent],
  templateUrl: './certificate.html',
  styleUrl: './certificate.css',
})
export class CertificateComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  private readonly document = inject(DOCUMENT);

  readonly courseId = Number(this.route.snapshot.paramMap.get('courseId'));
  readonly certificate = signal<Certificate | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly invalidCourseId = !Number.isInteger(this.courseId) || this.courseId <= 0;
  readonly courseLink = this.invalidCourseId ? ['/courses'] : ['/courses', this.courseId];

  constructor() {
    if (this.invalidCourseId) {
      this.errorMessage.set('The certificate link contains an invalid course ID.');
      return;
    }
    this.loadCertificate();
  }

  loadCertificate(): void {
    if (this.invalidCourseId || this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    this.courseService.getCertificate(this.courseId).subscribe({
      next: (certificate) => {
        this.certificate.set(certificate);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.certificate.set(null);
        this.errorMessage.set(this.safeErrorMessage(error));
        this.loading.set(false);
      },
    });
  }

  printCertificate(): void {
    this.document.defaultView?.print();
  }

  private safeErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 404) return 'The requested course could not be found.';
    if (error.status === 409) {
      return 'Your certificate is not available yet. Complete every course module and required quiz first.';
    }
    if (error.status === 0)
      return 'Unable to reach SkillForge. Check your connection and try again.';
    return 'Unable to load your certificate. Please try again.';
  }
}
