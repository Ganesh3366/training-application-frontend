# SkillForge Important Components

This document focuses on files important for understanding the system rather than every test, DTO, dialog, or stylesheet.

## Backend — configuration/security

### `TrainingApplicationBackendApplication`
Location: `src/main/java/com/ganesh/training_application_backend/TrainingApplicationBackendApplication.java`

Spring Boot entry point.

### `SecurityConfig`
Location: `.../config/SecurityConfig.java`

Defines BCrypt password encoding, session security-context persistence, session-ID change strategy, SPA CSRF handling, unauthenticated `401` behavior, public course/auth endpoints, admin authorization, and admin/instructor management authorization.

### `AuthenticationConfig`
Location: `.../config/AuthenticationConfig.java`

Authentication-related Spring configuration used alongside the database-backed user details service.

### `DatabaseUserDetailsService` / `AppUserPrincipal`
Location: `.../auth/`

Adapt persisted `AppUser` records to Spring Security authentication principals.

### `InitialAdminBootstrap`
Location: `.../auth/InitialAdminBootstrap.java`

Supports optional initial administrator creation from `APP_ADMIN_*` configuration.

## Backend — controllers and services

### `AuthController` / `AuthService`
Location: `.../auth/`

Responsibilities: signup, login, CSRF token retrieval, current user, logout, conversion to user response DTOs. Login explicitly establishes and saves an HTTP-session security context.

### `AdminUserController` / `AdminUserService`
Location: `.../admin/`

Responsibilities: list/get/create/update users, enable/disable accounts, list assignments, assign courses. Interacts with user/course/assignment persistence and password encoding.

### `CourseController` / `CourseService`
Location: `.../course/`

Public course read API: catalogue and course detail.

### `CourseManagementController` / `CourseManagementService`
Location: `.../course/`

Admin/Instructor CRUD for courses.

### `CourseModuleController` / `CourseModuleService`
Location: `.../course/`

Learner/public module reads. Module summaries are public; module detail is protected by security configuration.

### `CourseModuleManagementController` / `CourseModuleManagementService`
Location: `.../course/`

Admin/Instructor module CRUD and module-content CRUD, including ordering/relationship validation handled by the service.

### `QuizController` / `QuizService`
Location: `.../course/`

Learner quiz retrieval/submission. Important methods include `getQuiz`, `submitQuiz`, and `calculateScore`.

`calculateScore` uses:

```text
round(correctAnswers * 100.0 / totalQuestions)
```

`submitQuiz` validates complete answers, prevents duplicate question submissions, checks question/option ownership, determines pass/fail, and persists module progress.

### `QuizManagementController` / `QuizManagementService`
Location: `.../course/`

Admin/Instructor management of quiz configuration, questions, and answer options.

### `QuizConfigurationValidator`
Location: `.../course/QuizConfigurationValidator.java`

Validates that quiz configuration is usable before learner retrieval/submission.

### `ModuleProgressController` / `ModuleProgressService`
Location: `.../course/`

Returns authenticated learner course progress based on module progress records.

### `CertificateController` / `CertificateService`
Location: `.../course/`

Provides certificate retrieval/creation for an authenticated learner and course.

### `LearnerProgressReportController` / `LearnerProgressReportService`
Location: `.../reporting/`

Builds management reporting across learners/courses/modules, assignments, progress, and certificate data.

## Backend — repositories

Important Spring Data repositories:

- `AppUserRepository`
- `CourseAssignmentRepository`
- `CourseRepository`
- `CourseModuleRepository`
- `ModuleContentRepository`
- `QuizRepository`
- `QuizQuestionRepository`
- `AnswerOptionRepository`
- `ModuleProgressRepository`
- `CertificateRepository`

They are the data-access boundary used by services; there is no separate hand-written DAO layer in the inspected tree.

## Backend — entities

Important entities are documented in detail in `DATABASE.md`: `AppUser`, `CourseAssignment`, `Course`, `CourseModule`, `ModuleContent`, `Quiz`, `QuizQuestion`, `AnswerOption`, `ModuleProgress`, and `Certificate`.

## Backend — DTOs

DTOs are Java records under `admin/dto`, `auth/dto`, `course/dto`, and `reporting/dto`.

Notable request DTOs include:

- `SignupRequest`, `LoginRequest`
- `AdminUserCreateRequest`, `AdminUserUpdateRequest`, `AdminUserEnabledRequest`
- `CourseAssignmentRequest`
- `CourseCreateRequest`, `CourseUpdateRequest`
- `CourseModuleCreateRequest`, `CourseModuleUpdateRequest`
- `ModuleContentCreateRequest`, `ModuleContentUpdateRequest`
- `QuizManagementRequest`
- `QuizQuestionManagementRequest`
- `AnswerOptionManagementRequest`
- `QuizSubmissionRequest`, `QuizAnswerRequest`

Response DTOs keep API serialization separate from JPA entities.

## Frontend — application shell and routing

### `app.routes.ts`
Location: `frontend/src/app/app.routes.ts`

Defines lazy-loaded routes for home, courses, learning, certificates, admin users, management courses/modules/quizzes/reports, and certification. Applies `authenticatedGuard`, `adminRoleGuard`, and `managementRoleGuard` where required.

### `MainLayout`
Location: `frontend/src/app/layouts/main-layout/`

Application shell/navigation. Coordinates account state and sign-out UI with the auth service.

## Frontend — guards

- `authenticated.guard.ts` — protects learner-authenticated screens.
- `admin-role.guard.ts` — protects `/admin/users`.
- `management-role.guard.ts` — protects management screens for Admin/Instructor roles.

These improve navigation UX; backend authorization remains authoritative.

## Frontend — services

### `auth.ts`
Authentication API/session state including CSRF-aware behavior used by the SPA.

### `course.ts`
Course, module, learner quiz/progress/certificate-facing API access.

### `admin-user.ts`
Admin user and assignment API access.

### `course-management.ts`
Management course API access.

### `course-module-management.ts`
Management module/content API access.

### `quiz-management.ts`
Management quiz/question/answer-option API access.

### `learner-progress-report.ts`
Management reporting API access.

## Frontend — important pages

### `Home`
Location: `pages/home/`
Landing experience including the How It Works content.

### `Courses`
Location: `pages/courses/`
Course catalogue/listing.

### `CourseDetails`
Location: `pages/course-details/course-details.ts`
Course detail, module overview, learner access/start behavior.

### `ModuleLearning`
Location: `pages/module-learning/module-learning.ts`
Authenticated module learning experience. Displays module content, presents module quiz, submits answers, handles results/retry/completion state, and connects to progress/certificate navigation.

### `CertificateComponent`
Location: `pages/certificate/`
Authenticated certificate presentation for a completed eligible course.

### `AdminUserManagementComponent`
Location: `pages/admin-user-management/`
Admin user listing, creation/editing, account enable/disable, and course-assignment workflows. Supporting user/edit/status dialog components live beneath the same feature directory.

### `CourseManagementComponent`
Location: `pages/course-management/`
Admin/Instructor course CRUD UI with form and delete-confirmation components.

### `ModuleContentManagementComponent`
Location: `pages/module-content-management/`
Admin/Instructor module and content CRUD. Includes module/content forms and delete confirmation.

### `QuizManagementComponent`
Location: `pages/quiz-management/`
Admin/Instructor quiz setup, passing score, questions, and answer-option management.

### `LearnerProgressReportComponent`
Location: `pages/learner-progress-report/`
Admin/Instructor learner reporting UI. Groups report rows by learner and shows per-course assignment/progress/module/certificate details.

## Frontend — shared UI

- `shared/auth-dialog/` — signup/login dialog.
- `shared/back-navigation/` — reusable contextual back navigation.
- `shared/confirm-dialog/` — reusable confirmation dialog.

## Frontend — models and styles

`src/app/models/app.models.ts` contains shared TypeScript API/domain interfaces. Global styles live in `src/styles.scss`; feature-specific styles live next to components as `.css` files. Angular Material/CDK supply UI primitives.

## User flows

### Login
User opens the auth dialog -> frontend auth service calls `/api/auth/login` -> backend authenticates against database-backed users -> HTTP session is established -> Angular session state/navigation updates.

### Course browsing and learning
Public user browses `/courses` and course details -> authentication is required to enter a module -> module content loads -> learner submits the module quiz -> backend calculates score and records progress -> learner retries on failure or completes the module on pass.

### Course completion/certificate
Module progress accumulates across the course -> progress service determines course completion -> authenticated certificate endpoint returns/creates the certificate when eligible -> certificate screen displays participant/course/completion/final-score/certificate-number data.

### Course management
Admin/Instructor -> `/management/courses` -> create/update/delete courses -> manage modules/content -> configure module quiz/questions/options/passing score.

### Learner progress
Admin/Instructor -> `/management/reports` -> frontend reporting service loads `/api/management/reports/learner-courses` -> grouped learner/course progress is displayed.

### Admin user management
Admin -> `/admin/users` -> create/edit/enable/disable users and assign courses.

### Sign out
Authenticated user selects sign out -> confirmation UI -> `/api/auth/logout` -> server session security context is cleared -> frontend returns to signed-out navigation state.

## Developer notes

- Backend configuration: `backend/src/main/resources/application.properties`.
- Database configuration: same file; password comes from `DB_PASSWORD`.
- Backend API controllers: `backend/src/main/java/.../{auth,admin,course,reporting}`.
- Backend business logic: service classes in the same feature packages.
- Database queries: Spring Data repository interfaces in those feature packages.
- Frontend routing: `frontend/src/app/app.routes.ts`.
- Frontend API calls: `frontend/src/app/services/`.
- Frontend page styles: CSS files beside page components; global styling in `frontend/src/styles.scss`.
- Shared TypeScript API models: `frontend/src/app/models/app.models.ts`.

For a future feature, keep the existing pattern: add/extend backend DTO -> controller -> service -> repository/entity only when persistence is required; then add/extend frontend model -> service -> page/component and protect routes/API paths with the appropriate existing security model.
