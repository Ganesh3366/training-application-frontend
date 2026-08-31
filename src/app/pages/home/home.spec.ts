import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  it('renders the four-step How It Works learner journey', () => {
    TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector('#how-it-works') as HTMLElement | null;
    expect(section).not.toBeNull();
    if (section === null) throw new Error('How It Works section was not rendered.');

    const steps = section.querySelectorAll('.step-card');
    const stepHeadings = Array.from(section.querySelectorAll('h3')).map((heading) =>
      heading.textContent?.trim(),
    );

    expect(section.getAttribute('aria-labelledby')).toBe('how-it-works-heading');
    expect(steps).toHaveLength(4);
    expect(stepHeadings).toEqual([
      'Choose Your Course',
      'Learn Module by Module',
      'Take Quizzes',
      'Track Progress & Get Certified',
    ]);
  });

  it('preserves the existing course calls to action', () => {
    TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();

    const courseLinks = fixture.nativeElement.querySelectorAll('.cta-row a[href="/courses"]');
    expect(courseLinks).toHaveLength(2);
  });
});
