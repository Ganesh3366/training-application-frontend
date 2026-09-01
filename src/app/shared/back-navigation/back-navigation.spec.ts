import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BackNavigationComponent } from './back-navigation';

describe('BackNavigationComponent', () => {
  it('renders an accessible Angular link to the explicit destination', () => {
    TestBed.configureTestingModule({
      imports: [BackNavigationComponent],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(BackNavigationComponent);
    fixture.componentRef.setInput('label', 'Back to Course');
    fixture.componentRef.setInput('destination', ['/courses', 3]);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.textContent).toContain('Back to Course');
    expect(link.getAttribute('href')).toBe('/courses/3');
    expect(link.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
