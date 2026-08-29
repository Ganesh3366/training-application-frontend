import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  CourseModule,
  CourseModuleManagementRequest,
  ModuleContent,
  ModuleContentManagementRequest,
} from '../models/app.models';
import { CourseModuleManagementService } from './course-module-management';

describe('CourseModuleManagementService', () => {
  let service: CourseModuleManagementService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CourseModuleManagementService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('gets and creates modules at the nested course URL', () => {
    service.getModules(7).subscribe();
    const get = http.expectOne('/api/management/courses/7/modules');
    expect(get.request.method).toBe('GET');
    get.flush([module]);
    service.createModule(7, moduleRequest).subscribe();
    const create = http.expectOne('/api/management/courses/7/modules');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(moduleRequest);
    create.flush(module);
  });

  it('updates and deletes the correctly nested module', () => {
    service.updateModule(7, 3, moduleRequest).subscribe();
    const update = http.expectOne('/api/management/courses/7/modules/3');
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual(moduleRequest);
    update.flush(module);
    service.deleteModule(7, 3).subscribe();
    const deletion = http.expectOne('/api/management/courses/7/modules/3');
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null);
  });

  it('gets and creates content at the nested module URL', () => {
    service.getContents(7, 3).subscribe();
    const get = http.expectOne('/api/management/courses/7/modules/3/contents');
    expect(get.request.method).toBe('GET');
    get.flush([content]);
    service.createContent(7, 3, contentRequest).subscribe();
    const create = http.expectOne('/api/management/courses/7/modules/3/contents');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(contentRequest);
    create.flush(content);
  });

  it('updates and deletes the correctly nested content', () => {
    service.updateContent(7, 3, 9, contentRequest).subscribe();
    const update = http.expectOne('/api/management/courses/7/modules/3/contents/9');
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual(contentRequest);
    update.flush(content);
    service.deleteContent(7, 3, 9).subscribe();
    const deletion = http.expectOne('/api/management/courses/7/modules/3/contents/9');
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null);
  });
});

const moduleRequest: CourseModuleManagementRequest = { title: 'Foundations', description: null };
const module: CourseModule = { id: 3, title: 'Foundations', description: null, position: 1 };
const contentRequest: ModuleContentManagementRequest = {
  type: 'TEXT',
  title: 'Welcome',
  textContent: 'Hello',
  videoUrl: null,
};
const content: ModuleContent = { id: 9, position: 1, ...contentRequest };
