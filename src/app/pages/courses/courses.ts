import { Component, inject } from '@angular/core';
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
  readonly courses: Course[] = this.courseService.getCourses();
  readonly categories: CategoryCard[] = CATEGORY_ICONS.map((category) => ({
    ...category,
    courseCount: this.courses.filter((course) => course.category === category.name).length,
  }));

  courseIcon(course: Course): string {
    const icons: Record<Course['level'], string> = {
      Beginner: 'code',
      Intermediate: 'javascript',
      Advanced: 'data_object',
    };

    return icons[course.level];
  }
}
