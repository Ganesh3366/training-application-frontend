import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { defer, Observable, of, Subject, throwError } from 'rxjs';
import { CourseManagementResponse, CourseModule, ModuleContent } from '../../models/app.models';
import { CourseManagementService } from '../../services/course-management';
import { CourseModuleManagementService } from '../../services/course-module-management';
import { ModuleContentManagementComponent } from './module-content-management';

describe('ModuleContentManagementComponent', () => {
  function create(
    courseResponse: Observable<CourseManagementResponse> = of(course),
    moduleResponse: Observable<CourseModule[]> = of(modules),
    contentsResponse: (moduleId: number) => Observable<ModuleContent[]> = (id) =>
      of(id === 3 ? contents : []),
  ) {
    const moduleService = {
      getModules: vi.fn(() => moduleResponse),
      getContents: vi.fn((_courseId: number, moduleId: number) => contentsResponse(moduleId)),
      deleteModule: vi.fn(() => of(undefined)),
      deleteContent: vi.fn(() => of(undefined)),
      createModule: vi.fn(),
      updateModule: vi.fn(),
      createContent: vi.fn(),
      updateContent: vi.fn(),
    };
    const courseService = { getCourse: vi.fn(() => courseResponse) };
    TestBed.configureTestingModule({
      imports: [ModuleContentManagementComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ courseId: '7' }) } },
        },
        { provide: CourseManagementService, useValue: courseService },
        { provide: CourseModuleManagementService, useValue: moduleService },
      ],
    });
    const fixture = TestBed.createComponent(ModuleContentManagementComponent);
    const component = fixture.componentInstance;
    const dialog = (component as unknown as { dialog: MatDialog }).dialog;
    const snackBar = (component as unknown as { snackBar: MatSnackBar }).snackBar;
    const open = vi.spyOn(dialog, 'open');
    vi.spyOn(snackBar, 'open').mockReturnValue({} as never);
    fixture.detectChanges();
    return { fixture, component, open, moduleService, courseService };
  }

  it('shows loading then renders the course title, ordered modules and content', () => {
    const response = new Subject<CourseManagementResponse>();
    const { fixture, courseService } = create(response);
    expect(fixture.nativeElement.textContent).toContain('Loading modules');
    response.next(course);
    response.complete();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain(course.title);
    expect(text).toContain('Foundations');
    expect(text).toContain('Welcome');
    expect(courseService.getCourse).toHaveBeenCalledWith(7);
    expect(fixture.componentInstance.modules().map((item) => item.position)).toEqual([1, 2]);
  });

  it('shows an empty module state', () => {
    const { fixture } = create(of(course), of([]));
    expect(fixture.nativeElement.textContent).toContain('No modules yet');
  });

  it('recovers from a load failure on retry', () => {
    const responses = [throwError(() => new HttpErrorResponse({ status: 500 })), of(course)];
    const { fixture, courseService } = create(defer(() => responses.shift()!));
    expect(fixture.nativeElement.textContent).toContain('Module management unavailable');
    const retry = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Try again'))!;
    retry.click();
    fixture.detectChanges();
    expect(courseService.getCourse).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.textContent).toContain(course.title);
  });

  it('adds and edits modules in local position order', () => {
    const { component, open } = create();
    open.mockReturnValueOnce({ afterClosed: () => of(newModule) } as never);
    component.openModuleForm(null);
    expect(component.modules().map((item) => item.id)).toEqual([3, 4, 5]);
    const updated = { ...modules[0], title: 'Updated module' };
    open.mockReturnValueOnce({ afterClosed: () => of(updated) } as never);
    component.openModuleForm(modules[0]);
    expect(component.modules().find((item) => item.id === updated.id)?.title).toBe(
      'Updated module',
    );
  });

  it('requires confirmation and removes a module only after successful deletion', () => {
    const { component, open, moduleService } = create();
    open.mockReturnValueOnce({ afterClosed: () => of(false) } as never);
    component.confirmModuleDelete(modules[0]);
    expect(moduleService.deleteModule).not.toHaveBeenCalled();
    open.mockReturnValueOnce({ afterClosed: () => of(true) } as never);
    component.confirmModuleDelete(modules[0]);
    expect(moduleService.deleteModule).toHaveBeenCalledWith(7, 4);
    expect(component.modules().some((item) => item.id === 4)).toBe(false);
  });

  it('keeps a module and shows the protected dependency message for delete 409', () => {
    const { component, open, moduleService } = create();
    open.mockReturnValue({ afterClosed: () => of(true) } as never);
    moduleService.deleteModule.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409 })),
    );
    component.confirmModuleDelete(modules[0]);
    expect(component.actionError()).toContain('quiz or learner progress');
    expect(component.modules()).toHaveLength(2);
  });

  it('adds and edits content locally without reloading modules', () => {
    const { component, open, moduleService } = create();
    open.mockReturnValueOnce({ afterClosed: () => of(newContent) } as never);
    component.openContentForm(3, null);
    expect(component.contentsFor(3).map((item) => item.id)).toEqual([9, 10]);
    const updated = { ...contents[0], title: 'Updated content' };
    open.mockReturnValueOnce({ afterClosed: () => of(updated) } as never);
    component.openContentForm(3, contents[0]);
    expect(component.contentsFor(3)[0].title).toBe('Updated content');
    expect(moduleService.getModules).toHaveBeenCalledOnce();
  });

  it('requires confirmation and removes only the successfully deleted content', () => {
    const { component, open, moduleService } = create();
    open.mockReturnValueOnce({ afterClosed: () => of(false) } as never);
    component.confirmContentDelete(3, contents[0]);
    expect(moduleService.deleteContent).not.toHaveBeenCalled();
    open.mockReturnValueOnce({ afterClosed: () => of(true) } as never);
    component.confirmContentDelete(3, contents[0]);
    expect(moduleService.deleteContent).toHaveBeenCalledWith(7, 3, 9);
    expect(component.contentsFor(3)).toEqual([]);
    expect(component.modules()).toHaveLength(2);
  });

  it('does not show the module-specific protected message for content delete 409', () => {
    const { component, open, moduleService } = create();
    open.mockReturnValue({ afterClosed: () => of(true) } as never);
    moduleService.deleteContent.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409 })),
    );
    component.confirmContentDelete(3, contents[0]);
    expect(component.actionError()).toBe('Unable to delete the content. Please try again.');
    expect(component.actionError()).not.toContain('quiz');
    expect(component.contentsFor(3)).toEqual(contents);
  });
});

const course: CourseManagementResponse = {
  id: 7,
  title: 'Angular',
  description: 'Learn',
  instructor: 'Ada',
  duration: 8,
  level: 'BEGINNER',
  category: 'INFORMATION_TECHNOLOGY',
};
const modules: CourseModule[] = [
  { id: 4, title: 'Advanced', description: null, position: 2 },
  { id: 3, title: 'Foundations', description: 'Start here', position: 1 },
];
const contents: ModuleContent[] = [
  {
    id: 9,
    type: 'TEXT',
    title: 'Welcome',
    textContent: 'Hello learners',
    videoUrl: null,
    position: 1,
  },
];
const newModule: CourseModule = { id: 5, title: 'Practice', description: null, position: 3 };
const newContent: ModuleContent = {
  id: 10,
  type: 'VIDEO',
  title: 'Demo',
  textContent: null,
  videoUrl: 'https://example.test/video',
  position: 2,
};
