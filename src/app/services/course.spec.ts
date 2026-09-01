import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  Certificate,
  Course,
  CourseModule,
  CourseModuleDetail,
  CourseProgress,
  ModuleQuiz,
  QuizResult,
  QuizSubmission,
} from '../models/app.models';
import { CourseService } from './course';

describe('CourseService', () => {
  let service: CourseService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CourseService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets all courses', () => {
    const courses: Course[] = [course];
    service.getCourses().subscribe((result) => expect(result).toEqual(courses));
    const request = http.expectOne('/api/courses');
    expect(request.request.method).toBe('GET');
    request.flush(courses);
  });

  it('gets a course by id', () => {
    service.getCourseById(7).subscribe((result) => expect(result).toEqual(course));
    const request = http.expectOne('/api/courses/7');
    expect(request.request.method).toBe('GET');
    request.flush(course);
  });

  it('gets course modules', () => {
    const modules: CourseModule[] = [{ id: 2, title: 'Basics', description: null, position: 1 }];
    service.getModules(7).subscribe((result) => expect(result).toEqual(modules));
    const request = http.expectOne('/api/courses/7/modules');
    expect(request.request.method).toBe('GET');
    request.flush(modules);
  });

  it('gets course progress without sending a user id', () => {
    const progress: CourseProgress = {
      courseId: 7,
      totalModules: 1,
      completedModules: 0,
      pendingModules: 1,
      progressPercentage: 0,
      completed: false,
      status: 'NOT_STARTED',
      modules: [
        {
          moduleId: 2,
          completed: false,
          attemptsCount: 0,
          lastScore: null,
          bestScore: null,
          completedAt: null,
        },
      ],
    };
    service.getCourseProgress(7).subscribe((result) => expect(result).toEqual(progress));
    const request = http.expectOne('/api/courses/7/progress');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys()).toEqual([]);
    request.flush(progress);
  });

  it('gets the authenticated learner certificate without sending a user id', () => {
    const certificate: Certificate = {
      certificateNumber: 'SF-2026-ABCDEF123456',
      participantName: 'Learner Name',
      courseName: 'Introduction to Angular',
      completionDate: '2026-08-29',
      finalScore: 90,
    };
    service.getCertificate(7).subscribe((result) => expect(result).toEqual(certificate));
    const request = http.expectOne('/api/courses/7/certificate');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys()).toEqual([]);
    request.flush(certificate);
  });

  it('gets a module with its contents', () => {
    const module: CourseModuleDetail = {
      id: 2,
      title: 'Basics',
      description: null,
      position: 1,
      contents: [],
    };
    service.getModule(7, 2).subscribe((result) => expect(result).toEqual(module));
    const request = http.expectOne('/api/courses/7/modules/2');
    expect(request.request.method).toBe('GET');
    request.flush(module);
  });

  it('gets a module quiz from the nested URL', () => {
    const quiz: ModuleQuiz = {
      id: 1,
      title: 'Angular Fundamentals Quiz',
      passingScore: 70,
      questions: [
        {
          id: 10,
          questionText: 'What is a component?',
          position: 1,
          options: [{ id: 100, optionText: 'A UI building block', position: 1 }],
        },
      ],
    };

    service.getQuiz(7, 2).subscribe((result) => {
      expect(result).toEqual(quiz);
      expect(result.questions[0].options[0].optionText).toBe('A UI building block');
    });
    const request = http.expectOne('/api/courses/7/modules/2/quiz');
    expect(request.request.method).toBe('GET');
    request.flush(quiz);
  });

  it('submits quiz answers to the nested URL and returns the result', () => {
    const submission: QuizSubmission = {
      answers: [{ questionId: 10, optionId: 100 }],
    };
    const quizResult: QuizResult = {
      totalQuestions: 1,
      correctAnswers: 1,
      score: 100,
      passingScore: 70,
      passed: true,
    };

    service.submitQuiz(7, 2, submission).subscribe((result) => {
      expect(result).toEqual(quizResult);
      expect(result.passed).toBe(true);
    });
    const request = http.expectOne('/api/courses/7/modules/2/quiz/submit');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(submission);
    request.flush(quizResult);
  });
});

const course: Course = {
  id: 7,
  title: 'API Course',
  description: 'From the backend',
  instructor: 'Ada',
  duration: 8,
  level: 'Beginner',
  category: 'Business',
};
