# SkillForge Architecture

## High-level architecture

SkillForge is a separated single-page frontend plus REST backend architecture.

```text
Browser
  |
  v
Angular 22 SPA
  |  HTTP / JSON, session cookie, CSRF token
  v
Spring Security Filter Chain
  |
  v
REST Controllers
  |
  v
Services / Business Logic
  |
  v
Spring Data JPA Repositories
  |
  v
Hibernate / JDBC
  |
  v
PostgreSQL
```

During frontend development, Angular's proxy forwards `/api/**` to `http://localhost:8080`.

## Frontend layer

The frontend is an Angular standalone-component application. `app.routes.ts` lazy-loads page components. Route guards protect authenticated, admin-only, and management routes. Angular services centralize HTTP calls, while interfaces/types live in `src/app/models/app.models.ts`.

Important frontend areas:

- `guards/` — authentication and role navigation guards.
- `layouts/main-layout/` — application shell/navigation and account actions.
- `pages/` — feature screens.
- `services/` — backend API access.
- `shared/` — reusable dialogs and navigation components.
- `styles.scss` and component CSS files — global and local styling.

## Backend layer

The backend is Spring Boot 4.1.1 on Java 17. It exposes JSON REST endpoints and uses Spring Data JPA with PostgreSQL.

Packages are feature-oriented:

- `auth` — users, authentication, user details, bootstrap admin.
- `admin` — admin user management and course assignment.
- `course` — courses, modules, content, quizzes, progress, certificates.
- `reporting` — management learner reports.
- `config` — authentication/security configuration.

## Controller layer

Controllers map HTTP requests to services. They perform request binding/validation and return DTOs or `ResponseEntity` responses. Management endpoints are grouped below `/api/management/**`; admin endpoints below `/api/admin/**`.

## Service layer

Services contain business rules and transactional orchestration. Examples include:

- `AuthService`
- `AdminUserService`
- `CourseService` / `CourseManagementService`
- `CourseModuleService` / `CourseModuleManagementService`
- `QuizService` / `QuizManagementService`
- `ModuleProgressService`
- `CertificateService`
- `LearnerProgressReportService`

The learner quiz flow is implemented in `QuizService`: it validates quiz configuration and submitted answers, counts correct answers, calculates `Math.round(correctAnswers * 100.0 / totalQuestions)`, compares the result with the quiz passing score, and records the attempt in module progress.

## Repository/data-access layer

Spring Data JPA repositories provide persistence access for users, assignments, courses, modules, contents, quizzes, questions, answer options, progress, and certificates. Custom finder method names encode relationship-aware queries such as finding a quiz nested under a module/course.

## Entity/model layer

JPA entities represent persistent domain data. Core entities are:

- `AppUser`
- `CourseAssignment`
- `Course`
- `CourseModule`
- `ModuleContent`
- `Quiz`
- `QuizQuestion`
- `AnswerOption`
- `ModuleProgress`
- `Certificate`

See `DATABASE.md` for relationships and fields.

## DTO layer

The backend uses Java records under feature `dto` packages for API request/response contracts. This keeps persistence entities separate from external JSON payloads. The frontend mirrors API shapes with TypeScript models.

## Security/authentication layer

Spring Security uses:

- BCrypt password hashing.
- Database-backed `UserDetailsService`.
- HTTP session security context.
- Session ID change on successful authentication.
- Cookie-based CSRF token repository for SPA use.
- `401 Unauthorized` entry point for unauthenticated protected requests.
- Role rules: `/api/admin/**` requires `ADMIN`; `/api/management/**` requires `ADMIN` or `INSTRUCTOR`.
- Public signup/login/CSRF endpoints and public GET access to course catalogue/details/module summaries.

The Angular frontend adds route guards for user experience, but backend Spring Security remains the authorization boundary.

## Data flow example: learner submits a quiz

```text
ModuleLearning Angular component
        |
        v
Course/HTTP service
        |
POST /api/courses/{courseId}/modules/{moduleId}/quiz/submit
        |
        v
Spring Security (authenticated + CSRF)
        |
        v
QuizController
        |
        v
QuizService
  - loads quiz/questions/options
  - validates complete submission
  - checks selected options
  - calculates rounded percentage
  - compares with passingScore
  - records attempt/completion
        |
        v
JPA repositories
        |
        v
PostgreSQL
        |
        v
QuizResultResponse -> JSON -> Angular UI
```

## Data flow example: management

```text
Angular management page
    -> Angular management service
    -> /api/management/**
    -> Spring Security role check
    -> Management Controller
    -> Management Service
    -> Repository
    -> PostgreSQL
    -> Response DTO
    -> Angular page refresh/state update
```

## Configuration

Backend runtime configuration is in `src/main/resources/application.properties`. Frontend build/serve configuration is in `angular.json`; API development proxy configuration is in `src/proxy.conf.json`.
