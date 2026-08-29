export type Role = 'USER' | 'INSTRUCTOR' | 'ADMIN';

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CsrfTokenResponse {
  token: string;
  headerName: string;
  parameterName: string;
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

export type CourseManagementLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type CourseManagementCategory =
  | 'INFORMATION_TECHNOLOGY'
  | 'HEALTH'
  | 'BUSINESS'
  | 'SALES_MARKETING'
  | 'MANAGEMENT'
  | 'ENGINEERING'
  | 'ELECTRICAL_ELECTRONICS'
  | 'ARTIFICIAL_INTELLIGENCE'
  | 'FINANCE'
  | 'AGRICULTURE';

export interface CourseManagementResponse {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: number;
  level: CourseManagementLevel;
  category: CourseManagementCategory;
}

export interface CourseManagementRequest {
  title: string;
  description: string;
  instructor: string;
  duration: number;
  level: CourseManagementLevel;
  category: CourseManagementCategory;
}

export interface CourseModule {
  id: number;
  title: string;
  description: string | null;
  position: number;
}

export interface ModuleProgress {
  moduleId: number;
  completed: boolean;
  attemptsCount: number;
  lastScore: number | null;
  bestScore: number | null;
  completedAt: string | null;
}

export interface CourseProgress {
  courseId: number;
  totalModules: number;
  completedModules: number;
  pendingModules: number;
  modules: ModuleProgress[];
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

export interface QuizAnswerOption {
  id: number;
  optionText: string;
  position: number;
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  position: number;
  options: QuizAnswerOption[];
}

export interface ModuleQuiz {
  id: number;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionId: number;
  optionId: number;
}

export interface QuizSubmission {
  answers: QuizAnswer[];
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passingScore: number;
  passed: boolean;
}
