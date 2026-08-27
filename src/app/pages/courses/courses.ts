import { Component, inject } from '@angular/core';
import { Course } from '../../models/app.models';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../services/course';

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
  private readonly courseService = inject(CourseService);
  readonly courses: Course[] = this.courseService.getCourses();
}
