# SkillForge Database Documentation

The backend uses PostgreSQL through Spring Data JPA/Hibernate. Primary keys use identity generation. The configured database is `training_application`.

## Entity relationship overview

```text
app_users ──< course_assignments >── courses
    |                                |
    |                                └──< course_modules
    |                                      |──< module_contents
    |                                      └──1 quizzes
    |                                             └──< quiz_questions
    |                                                    └──< answer_options
    |
    └──< module_progress >──────────── course_modules
    |
    └──< certificates >─────────────── courses
```

`<` indicates many rows on that side. `CourseModule` to `Quiz` is one-to-one in the entity mapping.

## `app_users` — `AppUser`

Primary key: `id`.

Important fields: `name`, unique `email`, `passwordHash`, `role`, `enabled`.

Passwords are represented by a stored password hash; Spring Security uses BCrypt.

## `course_assignments` — `CourseAssignment`

Primary key: `id`.

Foreign keys:
- `user_id` -> `app_users`
- `course_id` -> `courses`

Other field: `assignedAt`.

Unique constraint: one assignment per `(user_id, course_id)`.

## `courses` — `Course`

Primary key: `id`.

Fields: `title`, `description` (`TEXT`), `instructor`, `duration`, `level`, `category`.

`level` and `category` are persisted as enum strings.

## `course_modules` — `CourseModule`

Primary key: `id`.

Foreign key: `course_id` -> `courses`.

Fields: `title`, `description`, `position`.

A course can contain many modules.

## `module_contents` — `ModuleContent`

Primary key: `id`.

Foreign key: `module_id` -> `course_modules`.

Fields: `type`, `title`, `textContent` (`TEXT`), `videoUrl`, `position`.

Content type is stored as an enum string and supports the project's text/video content model.

## `quizzes` — `Quiz`

Primary key: `id`.

Foreign key: unique `module_id` -> `course_modules`.

Fields: `title`, `passingScore`.

`module_id` is unique, enforcing at most one quiz per module. Passing score is guarded in the entity/service DTO path to the range 0–100.

## `quiz_questions` — `QuizQuestion`

Primary key: `id`.

Foreign key: `quiz_id` -> `quizzes`.

Fields: `questionText` (`TEXT`), `position`.

## `answer_options` — `AnswerOption`

Primary key: `id`.

Foreign key: `question_id` -> `quiz_questions`.

Fields: `optionText` (`TEXT`), `correct`, `position`.

The learner-facing DTO intentionally omits the `correct` flag.

## `module_progress` — `ModuleProgress`

Primary key: `id`.

Foreign keys:
- `user_id` -> `app_users`
- `module_id` -> `course_modules`

Fields: `attemptsCount`, `lastScore`, `bestScore`, `completed`, `completedAt`.

Unique constraint: one progress row per `(user_id, module_id)`.

`recordAttempt` increments attempts, stores the latest score, preserves the maximum best score, and marks completion/time on the first passing attempt.

## `certificates` — `Certificate`

Primary key: `id`.

Foreign keys:
- `user_id` -> `app_users`
- `course_id` -> `courses`

Fields: `participantName`, `courseName`, `completionDate`, `finalScore`, unique `certificateNumber`, `createdAt`.

Unique constraint: one certificate per `(user_id, course_id)`.

Certificate display fields are stored as immutable snapshot-style values (`updatable=false`) in the entity.

## Schema management

The application uses:

```properties
spring.jpa.hibernate.ddl-auto=update
```

No migration scripts/framework were present in the inspected repository. Do not treat this document as a migration specification; it describes the current JPA mappings only.
