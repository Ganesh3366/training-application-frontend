export type Role = 'user' | 'instructor' | 'admin';

export interface AppUser {
  name: string;
  email: string;
  role: Role;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export type CourseCategory =
  | 'Information Technology (IT)'
  | 'Health'
  | 'Business'
  | 'Sales & Marketing'
  | 'Management'
  | 'Engineering'
  | 'Electrical & Electronics'
  | 'Artificial Intelligence (AI)'
  | 'Finance'
  | 'Agriculture';

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: number; // in hours
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: CourseCategory;
}

export interface CourseModule {
  id: number;
  title: string;
  description: string | null;
  position: number;
}

export type ModuleContentType = 'TEXT' | 'VIDEO';

export interface ModuleContent {
  id: number;
  type: ModuleContentType;
  title: string;
  textContent: string | null;
  videoUrl: string | null;
  position: number;
}

export interface CourseModuleDetail {
  id: number;
  title: string;
  description: string | null;
  position: number;
  contents: ModuleContent[];
}
