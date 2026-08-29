import { CourseManagementCategory, CourseManagementLevel } from '../../models/app.models';

export interface CourseManagementOption<T extends string> {
  value: T;
  label: string;
}

export const COURSE_LEVEL_OPTIONS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
] as const satisfies ReadonlyArray<CourseManagementOption<CourseManagementLevel>>;

export const COURSE_CATEGORY_OPTIONS = [
  { value: 'INFORMATION_TECHNOLOGY', label: 'Information Technology (IT)' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'SALES_MARKETING', label: 'Sales & Marketing' },
  { value: 'MANAGEMENT', label: 'Management' },
  { value: 'ENGINEERING', label: 'Engineering' },
  { value: 'ELECTRICAL_ELECTRONICS', label: 'Electrical & Electronics' },
  { value: 'ARTIFICIAL_INTELLIGENCE', label: 'Artificial Intelligence (AI)' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'AGRICULTURE', label: 'Agriculture' },
] as const satisfies ReadonlyArray<CourseManagementOption<CourseManagementCategory>>;

function labelMap<T extends string>(
  options: ReadonlyArray<CourseManagementOption<T>>,
): Record<T, string> {
  return Object.fromEntries(options.map(({ value, label }) => [value, label])) as Record<T, string>;
}

export const COURSE_LEVEL_LABELS = labelMap<CourseManagementLevel>(COURSE_LEVEL_OPTIONS);
export const COURSE_CATEGORY_LABELS = labelMap<CourseManagementCategory>(COURSE_CATEGORY_OPTIONS);
