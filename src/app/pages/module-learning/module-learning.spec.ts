import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { CourseModuleDetail } from '../../models/app.models';
import { CourseService } from '../../services/course';
import { ModuleLearning } from './module-learning';

describe('ModuleLearning', () => {
  function create(
    response: Observable<CourseModuleDetail>,
    courseId = '3',
    moduleId = '9',
    getModule = () => response,
  ): ComponentFixture<ModuleLearning> {
    TestBed.configureTestingModule({
      imports: [ModuleLearning],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ courseId, moduleId }) } } },
        { provide: CourseService, useValue: { getModule } },
      ],
    });
    const fixture = TestBed.createComponent(ModuleLearning);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('displays the module title, description, and TEXT content', () => {
    const fixture = create(of(moduleDetail));
    expect(fixture.nativeElement.textContent).toContain('HTTP Foundations');
    expect(fixture.nativeElement.textContent).toContain('Learn request fundamentals.');
    expect(fixture.nativeElement.textContent).toContain('Plain text lesson');
  });

  it('embeds a validated YouTube URL', () => {
    const fixture = create(of(withVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ')));
    const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute('src')).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ');
    expect(iframe.title).toBe('Watch this');
  });

  it('rejects non-YouTube video URLs', () => {
    const fixture = create(of(withVideo('https://example.com/watch?v=dQw4w9WgXcQ')));
    expect(fixture.nativeElement.querySelector('iframe')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Video unavailable.');
  });

  it('shows a fallback when TEXT content is missing', () => {
    const detail: CourseModuleDetail = {
      ...moduleDetail,
      contents: [{ ...moduleDetail.contents[0], textContent: '  ' }],
    };
    expect(create(of(detail)).nativeElement.textContent).toContain('Content unavailable.');
  });

  it('shows module not found for a 404', () => {
    const error = new HttpErrorResponse({ status: 404 });
    expect(create(throwError(() => error)).nativeElement.textContent).toContain('Module not found.');
  });

  it('shows a safe general API error', () => {
    const error = new HttpErrorResponse({ status: 500 });
    expect(create(throwError(() => error)).nativeElement.textContent).toContain('Unable to load module.');
  });

  it('shows the empty content state', () => {
    expect(create(of({ ...moduleDetail, contents: [] })).nativeElement.textContent)
      .toContain('No content is available for this module yet.');
  });

  it('rejects invalid route ids without calling the service', () => {
    const getModule = vi.fn(() => of(moduleDetail));
    const fixture = create(of(moduleDetail), '0', 'not-a-number', getModule);
    expect(fixture.nativeElement.textContent).toContain('Module not found.');
    expect(getModule).not.toHaveBeenCalled();
  });
});

const moduleDetail: CourseModuleDetail = {
  id: 9,
  title: 'HTTP Foundations',
  description: 'Learn request fundamentals.',
  position: 1,
  contents: [{
    id: 100,
    type: 'TEXT',
    title: 'Read this',
    textContent: 'Plain text lesson',
    videoUrl: null,
    position: 1,
  }],
};

function withVideo(videoUrl: string): CourseModuleDetail {
  return {
    ...moduleDetail,
    contents: [{
      id: 101,
      type: 'VIDEO',
      title: 'Watch this',
      textContent: null,
      videoUrl,
      position: 1,
    }],
  };
}
