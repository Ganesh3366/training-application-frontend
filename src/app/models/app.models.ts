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

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: number; // in hours
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}
