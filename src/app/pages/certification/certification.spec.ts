import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Certification } from './certification';

describe('Certification', () => {
  it('explains how certificates are earned and what they contain', () => {
    TestBed.configureTestingModule({ imports: [Certification], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Certification);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).not.toContain('Certification details will be displayed here.');
    expect(text).toContain('Complete every module');
    expect(text).toContain('Pass required quizzes');
    expect(text).toContain('participant name');
    expect(fixture.nativeElement.querySelector('a[href="/courses"]')).not.toBeNull();
  });
});
