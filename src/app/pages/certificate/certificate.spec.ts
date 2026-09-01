import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { defer, Observable, of, Subject, throwError } from 'rxjs';
import { Certificate } from '../../models/app.models';
import { CourseService } from '../../services/course';
import { CertificateComponent } from './certificate';

describe('CertificateComponent', () => {
  function create(
    response: Observable<Certificate> = of(certificate),
    courseId = '3',
  ): { fixture: ComponentFixture<CertificateComponent>; getCertificate: ReturnType<typeof vi.fn> } {
    const getCertificate = vi.fn(() => response);
    TestBed.configureTestingModule({
      imports: [CertificateComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ courseId }) } },
        },
        { provide: CourseService, useValue: { getCertificate } },
      ],
    });
    const fixture = TestBed.createComponent(CertificateComponent);
    fixture.detectChanges();
    return { fixture, getCertificate };
  }

  it('renders every value returned by the certificate API', () => {
    const text = create().fixture.nativeElement.textContent;
    expect(text).toContain(certificate.participantName);
    expect(text).toContain(certificate.courseName);
    expect(text).toContain(certificate.completionDate);
    expect(text).toContain(`${certificate.finalScore}%`);
    expect(text).toContain(certificate.certificateNumber);
  });

  it('links back to the current course using the course route id', () => {
    const { fixture } = create(of(certificate), '47');
    const link = fixture.nativeElement.querySelector('app-back-navigation a') as HTMLAnchorElement;

    expect(link.textContent).toContain('Back to Course');
    expect(link.getAttribute('href')).toBe('/courses/47');
  });

  it('shows a loading status while the API request is pending', () => {
    const { fixture } = create(new Subject<Certificate>());
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'Preparing',
    );
  });

  it('rejects an invalid course id without calling the API', () => {
    const { fixture, getCertificate } = create(of(certificate), '1.5');
    expect(fixture.nativeElement.textContent).toContain('invalid course ID');
    expect(getCertificate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('app-back-navigation a')?.getAttribute('href')).toBe(
      '/courses',
    );
  });

  it.each([
    [404, 'course could not be found'],
    [409, 'not available yet'],
    [500, 'Unable to load your certificate'],
  ] as const)('shows safe feedback for HTTP %s', (status, message) => {
    const response = throwError(() => new HttpErrorResponse({ status }));
    const text = create(response).fixture.nativeElement.textContent;
    expect(text).toContain(message);
    expect(text).not.toContain('HttpErrorResponse');
  });

  it('retries a failed request and renders the recovered certificate', () => {
    const responses = [throwError(() => new HttpErrorResponse({ status: 500 })), of(certificate)];
    const { fixture, getCertificate } = create(defer(() => responses.shift()!));
    const retry = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Try again'))!;
    retry.click();
    fixture.detectChanges();
    expect(getCertificate).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.textContent).toContain(certificate.certificateNumber);
  });

  it('invokes browser printing from the print action', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const { fixture } = create();
    const button = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((item) => item.textContent?.includes('Print / Save as PDF'))!;
    button.click();
    expect(print).toHaveBeenCalledOnce();
    print.mockRestore();
  });
});

const certificate: Certificate = {
  certificateNumber: 'SF-2026-ABCDEF123456',
  participantName: 'Learner Name',
  courseName: 'Introduction to Angular',
  completionDate: '2026-08-29',
  finalScore: 90,
};
