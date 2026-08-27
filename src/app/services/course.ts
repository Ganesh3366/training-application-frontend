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
      category: 'Information Technology (IT)',
    },
    {
      id: 2,
      title: 'Advanced TypeScript',
      description: 'Deep dive into TypeScript features and best practices.',
      instructor: 'Jane Smith',
      duration: 15,
      level: 'Advanced',
      category: 'Information Technology (IT)',
    },
    {
      id: 3,
      title: 'Intermediate JavaScript',
      description: 'Enhance your JavaScript skills with intermediate concepts.',
      instructor: 'Alice Johnson',
      duration: 12,
      level: 'Intermediate',
      category: 'Information Technology (IT)',
    },
    {
      id: 4,
      title: 'Responsive Web Design',
      description: 'Build adaptable interfaces that work across desktop, tablet, and mobile screens.',
      instructor: 'Michael Chen',
      duration: 8,
      level: 'Beginner',
      category: 'Information Technology (IT)',
    },
    {
      id: 5,
      title: 'Angular State Management',
      description: 'Manage application state with clear, maintainable reactive patterns.',
      instructor: 'Priya Sharma',
      duration: 14,
      level: 'Advanced',
      category: 'Engineering',
    },
    {
      id: 6,
      title: 'Modern CSS Layouts',
      description: 'Create structured page layouts using Flexbox, Grid, and responsive CSS.',
      instructor: 'David Wilson',
      duration: 9,
      level: 'Intermediate',
      category: 'Information Technology (IT)',
    },
  ];

  getCourses(): Course[] {
    return this.courses;
  }

  getCourseById(id: number): Course | undefined {
    return this.courses.find(course => course.id === id);
  }
}
