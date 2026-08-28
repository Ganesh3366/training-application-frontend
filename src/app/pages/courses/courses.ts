import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Course, CourseCategory } from '../../models/app.models';
import { CourseService } from '../../services/course';

interface CategoryCard {
  name: CourseCategory;
  icon: string;
  courseCount: number;
}

const CATEGORY_ICONS: ReadonlyArray<Pick<CategoryCard, 'name' | 'icon'>> = [
  { name: 'Information Technology (IT)', icon: 'computer' },
  { name: 'Health', icon: 'health_and_safety' },
  { name: 'Business', icon: 'business_center' },
  { name: 'Sales & Marketing', icon: 'campaign' },
  { name: 'Management', icon: 'groups' },
  { name: 'Engineering', icon: 'engineering' },
  { name: 'Electrical & Electronics', icon: 'electrical_services' },
  { name: 'Artificial Intelligence (AI)', icon: 'psychology' },
  { name: 'Finance', icon: 'account_balance' },
  { name: 'Agriculture', icon: 'agriculture' },
];

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses {
  private readonly courseService = inject(CourseService);
  readonly courses = signal<Course[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly categories = computed<CategoryCard[]>(() =>
    CATEGORY_ICONS.map((category) => ({
      ...category,
      courseCount: this.courses().filter((course) => course.category === category.name).length,
    })),
  );

  constructor() {
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load courses.');
        this.loading.set(false);
      },
    });
  }

  courseIcon(course: Course): string {
    const icons: Record<Course['level'], string> = {
      Beginner: 'code',
      Intermediate: 'javascript',
      Advanced: 'data_object',
    };

    return icons[course.level];
  }
}
