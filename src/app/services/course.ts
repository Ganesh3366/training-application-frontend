import { Injectable } from '@angular/core';
import { Course } from '../models/app.models';
@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private courses: Course[] = [
    {
      id: 1,
      title: 'Introduction to Angular',
      description: 'Learn the basics of Angular framework.',
      instructor: 'John Doe',
      duration: 10,
      level: 'Beginner',
    },
    {
      id: 2,
      title: 'Advanced TypeScript',
      description: 'Deep dive into TypeScript features and best practices.',
      instructor: 'Jane Smith',
      duration: 15,
      level: 'Advanced',
    },
    {
      id: 3,
      title: 'Intermediate JavaScript',
      description: 'Enhance your JavaScript skills with intermediate concepts.',
      instructor: 'Alice Johnson',
      duration: 12,
      level: 'Intermediate',
    },
  ];

  getCourses(): Course[] {
    return this.courses;
  }

  getCourseById(id: number): Course | undefined {
    return this.courses.find(course => course.id === id);
  }
}
