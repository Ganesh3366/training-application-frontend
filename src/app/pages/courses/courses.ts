import { Component } from '@angular/core';
import { Course } from '../../models/app.models';
import { MatCardModule } from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, RouterLink],
  template: `
    <section>
      <h1>Courses</h1>

      @for (course of courses; track course.id) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ course.title }}</mat-card-title>
            <mat-card-subtitle>
              {{ course.level }} · {{ course.duration }} hours
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p>{{ course.description }}</p>
            <p>Instructor: {{ course.instructor }}</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-flat-button [routerLink]="['/courses', course.id]">View Course</button>
          </mat-card-actions>
        </mat-card>
      }
    </section>
  `,
})
export class Courses {
  readonly courses: Course[] = [
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
      title: 'Learn React',
      description: 'Learn the basics of React framework.',
      instructor: 'Alice Johnson',
      duration: 12,
      level: 'Intermediate',
    },
  ];
}
