import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseModuleDetail, ModuleContent } from '../../models/app.models';
import { CourseService } from '../../services/course';

@Component({
  selector: 'app-module-learning',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="learning-page">
      <a class="back-link" [routerLink]="['/courses', courseId]">Back to Course</a>
      @if (loading()) {
        <section><p role="status">Loading module...</p></section>
      } @else if (errorMessage()) {
        <section>
          <h1>{{ errorMessage() }}</h1>
          @if (notFound()) { <p>The requested module does not exist.</p> }
        </section>
      } @else if (module(); as selectedModule) {
        <section>
          <h1>{{ selectedModule.title }}</h1>
          @if (selectedModule.description) { <p>{{ selectedModule.description }}</p> }

          @if (selectedModule.contents.length === 0) {
            <p class="empty-message">No content is available for this module yet.</p>
          } @else {
            <div class="content-list">
              @for (content of selectedModule.contents; track content.id) {
                <article>
                  <h2>{{ content.title }}</h2>
                  @if (content.type === 'TEXT') {
                    <p class="text-content">{{ content.textContent?.trim() || 'Content unavailable.' }}</p>
                  } @else if (content.type === 'VIDEO') {
                    @if (videoEmbedUrl(content); as embedUrl) {
                      <div class="video-frame">
                        <iframe
                          [src]="embedUrl"
                          [title]="content.title"
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen>
                        </iframe>
                      </div>
                    } @else {
                      <p>Video unavailable.</p>
                    }
                  }
                </article>
              }
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: `
    :host { display: block; background: #f6f9ff; }
    .learning-page { max-width: 900px; margin: 0 auto; padding: 36px; }
    section, article { border: 1px solid #dce7f5; border-radius: 14px; background: #fff; }
    section { margin-top: 18px; padding: 28px; box-shadow: 0 12px 32px rgba(19, 61, 112, 0.09); }
    article { padding: 20px; }
    h1, h2 { color: #06183a; }
    h1, h2 { margin-top: 0; }
    h2 { font-size: 19px; }
    p { color: #536073; line-height: 1.6; }
    .back-link { color: #0873db; font-weight: 700; }
    .content-list { display: grid; gap: 16px; margin-top: 24px; }
    .text-content { white-space: pre-wrap; }
    .video-frame { position: relative; width: 100%; padding-top: 56.25%; overflow: hidden; border-radius: 10px; background: #06183a; }
    iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
    .empty-message { margin-top: 24px; }
    @media (max-width: 640px) { .learning-page { padding: 22px 18px; } section { padding: 20px; } }
  `,
})
export class ModuleLearning {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly courseId = Number(this.route.snapshot.paramMap.get('courseId'));
  readonly moduleId = Number(this.route.snapshot.paramMap.get('moduleId'));
  readonly module = signal<CourseModuleDetail | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly notFound = signal(false);

  constructor() {
    if (!this.isPositiveInteger(this.courseId) || !this.isPositiveInteger(this.moduleId)) {
      this.showNotFound();
      return;
    }

    this.courseService.getModule(this.courseId, this.moduleId).subscribe({
      next: (module) => {
        this.module.set(module);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) this.showNotFound();
        else {
          this.errorMessage.set('Unable to load module.');
          this.loading.set(false);
        }
      },
    });
  }

  videoEmbedUrl(content: ModuleContent): SafeResourceUrl | null {
    const videoId = this.youtubeVideoId(content.videoUrl);
    return videoId
      ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`)
      : null;
  }

  private youtubeVideoId(value: string | null): string | null {
    if (!value) return null;

    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.port || url.username || url.password) return null;

      let videoId: string | null = null;
      if (url.hostname === 'www.youtube.com' && url.pathname === '/watch') {
        videoId = url.searchParams.get('v');
      } else if (url.hostname === 'www.youtube.com' && url.pathname.startsWith('/embed/')) {
        const parts = url.pathname.split('/').filter(Boolean);
        videoId = parts.length === 2 ? parts[1] : null;
      } else if (url.hostname === 'youtu.be') {
        const parts = url.pathname.split('/').filter(Boolean);
        videoId = parts.length === 1 ? parts[0] : null;
      }

      return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId) ? videoId : null;
    } catch {
      return null;
    }
  }

  private isPositiveInteger(value: number): boolean {
    return Number.isInteger(value) && value > 0;
  }

  private showNotFound(): void {
    this.notFound.set(true);
    this.errorMessage.set('Module not found.');
    this.loading.set(false);
  }
}
