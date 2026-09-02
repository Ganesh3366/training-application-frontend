# SkillForge API Documentation

Base backend URL in the inspected configuration: `http://localhost:8080`.

## Security conventions

- Public: signup, login, CSRF token, public course reads listed below.
- Authenticated: current-user/logout, module detail, quiz read/submit, course progress, certificate.
- `ADMIN`: `/api/admin/**`.
- `ADMIN` or `INSTRUCTOR`: `/api/management/**`.
- State-changing protected requests are subject to Spring Security CSRF protection. Signup and login are explicitly excluded from CSRF enforcement.
- Validation failures may return `400`; unauthenticated protected access returns `401`; authorization failures may return `403`; missing nested resources are handled by services as appropriate, commonly `404`.

## Authentication

### POST `/api/auth/signup`
Creates a learner/user account.

Request body:
```json
{"name":"Example User","email":"user@example.com","password":"minimum8chars"}
```
Validation: name max 100; valid email max 254; password 8–72 characters.

Response: `201 Created`, `UserResponse`.

### POST `/api/auth/login`
Authenticates by normalized email/password and stores the security context in the HTTP session.

Request body:
```json
{"email":"user@example.com","password":"your_password"}
```
Response: `UserResponse`. Invalid credentials explicitly produce `401 Unauthorized`.

### GET `/api/auth/csrf`
Public endpoint returning the current CSRF token, header name, and parameter name.

### GET `/api/auth/me`
Returns the authenticated user as `UserResponse`.

### POST `/api/auth/logout`
Logs out the current session and returns `204 No Content`.

## Public / learner course API

### GET `/api/courses`
Returns all courses as `CourseResponse[]`. Public GET.

### GET `/api/courses/{id}`
Returns one course by ID as `CourseResponse`. Public GET.

Path: `id` — course ID.

### GET `/api/courses/{courseId}/modules`
Returns module summaries for a course as `CourseModuleSummaryResponse[]`. Public GET.

### GET `/api/courses/{courseId}/modules/{moduleId}`
Returns module detail/content as `CourseModuleResponse`. Authentication required.

### GET `/api/courses/{courseId}/modules/{moduleId}/quiz`
Returns learner-safe quiz data as `QuizResponse`. Authentication required. Correct-answer flags are not part of the learner answer-option response DTO.

### POST `/api/courses/{courseId}/modules/{moduleId}/quiz/submit`
Submits exactly one answer for every quiz question. Authentication required.

Request body:
```json
{
  "answers": [
    {"questionId": 1, "optionId": 3},
    {"questionId": 2, "optionId": 7}
  ]
}
```

The service rejects incomplete submissions, duplicate question answers, questions outside the quiz, or options outside their question with `400 Bad Request`.

Response: `QuizResultResponse` containing total questions, correct answers, calculated score, passing score, and pass/fail result.

Scoring formula:
```text
score = round(correctAnswers * 100.0 / totalQuestions)
passed = score >= passingScore
```

### GET `/api/courses/{courseId}/progress`
Returns authenticated learner course progress as `CourseProgressResponse`.

### GET `/api/courses/{courseId}/certificate`
Returns the authenticated learner's certificate, creating it when the certificate service determines the learner is eligible. Response: `CertificateResponse`.

## Admin user API

All endpoints below require role `ADMIN`.

### GET `/api/admin/users`
Returns all managed users as `UserResponse[]`.

### POST `/api/admin/users`
Creates a user.

Request body fields:
```json
{
  "firstName":"First",
  "lastName":"Last",
  "email":"user@example.com",
  "password":"minimum8chars",
  "role":"INSTRUCTOR"
}
```
Password must contain 8–72 nonblank characters. Response: `201 Created`, `UserResponse`.

### GET `/api/admin/users/{userId}`
Returns one managed user.

### PUT `/api/admin/users/{userId}`
Updates an existing user using `AdminUserUpdateRequest`. The current admin identity is passed to the service so self-sensitive rules can be enforced by business logic.

### PATCH `/api/admin/users/{userId}/enabled`
Enables or disables a user using `AdminUserEnabledRequest`.

### GET `/api/admin/users/{userId}/assignments`
Returns course assignments for the user as `CourseAssignmentResponse[]`.

### POST `/api/admin/users/{userId}/assignments`
Assigns a course using `CourseAssignmentRequest`; returns `201 Created` and `CourseAssignmentResponse`.

## Course management API

All `/api/management/**` endpoints require `ADMIN` or `INSTRUCTOR`.

### GET `/api/management/courses`
Returns managed courses as `CourseManagementResponse[]`.

### GET `/api/management/courses/{courseId}`
Returns one managed course.

### POST `/api/management/courses`
Creates a course; returns `201 Created`.

Request body:
```json
{
  "title":"Course title",
  "description":"Course description",
  "instructor":"Instructor name",
  "duration":120,
  "level":"BEGINNER",
  "category":"..."
}
```
`duration` must be positive; `level` and `category` must be valid project enum values.

### PUT `/api/management/courses/{courseId}`
Updates a course using `CourseUpdateRequest`.

### DELETE `/api/management/courses/{courseId}`
Deletes a course and returns `204 No Content` when successful.

## Module/content management API

Base: `/api/management/courses/{courseId}/modules`

### GET `/api/management/courses/{courseId}/modules`
Returns `CourseModuleManagementResponse[]`.

### POST `/api/management/courses/{courseId}/modules`
Creates a module from `CourseModuleCreateRequest`; returns `201 Created`.

### PUT `/api/management/courses/{courseId}/modules/{moduleId}`
Updates a module from `CourseModuleUpdateRequest`.

### DELETE `/api/management/courses/{courseId}/modules/{moduleId}`
Deletes a module; returns `204 No Content`.

### GET `/api/management/courses/{courseId}/modules/{moduleId}/contents`
Returns `ModuleContentManagementResponse[]`.

### POST `/api/management/courses/{courseId}/modules/{moduleId}/contents`
Creates text/video module content from `ModuleContentCreateRequest`; returns `201 Created`.

### PUT `/api/management/courses/{courseId}/modules/{moduleId}/contents/{contentId}`
Updates content from `ModuleContentUpdateRequest`.

### DELETE `/api/management/courses/{courseId}/modules/{moduleId}/contents/{contentId}`
Deletes content; returns `204 No Content`.

## Quiz management API

Base: `/api/management/courses/{courseId}/modules/{moduleId}/quiz`

### GET base
Returns `QuizManagementResponse`.

### POST base
Creates a quiz; returns `201 Created`.

Request body:
```json
{"title":"Module Quiz","passingScore":80}
```
`passingScore` is validated from 0 through 100.

### PUT base
Updates quiz title/passing score using the same `QuizManagementRequest` shape.

### DELETE base
Deletes the quiz; returns `204 No Content`.

### POST `.../quiz/questions`
Creates a question from `QuizQuestionManagementRequest`; returns `201 Created`.

### PUT `.../quiz/questions/{questionId}`
Updates a question.

### DELETE `.../quiz/questions/{questionId}`
Deletes a question; returns `204 No Content`.

### POST `.../quiz/questions/{questionId}/options`
Creates an answer option from `AnswerOptionManagementRequest`; returns `201 Created`.

### PUT `.../quiz/questions/{questionId}/options/{optionId}`
Updates an answer option.

### DELETE `.../quiz/questions/{questionId}/options/{optionId}`
Deletes an answer option; returns `204 No Content`.

## Reporting API

### GET `/api/management/reports/learner-courses`
Requires `ADMIN` or `INSTRUCTOR`. Returns `LearnerCourseReportResponse[]` containing learner/course reporting information assembled by `LearnerProgressReportService`.

## Status-code note

The controller source explicitly establishes `201` for create operations and `204` for the listed delete/logout operations. `401` is explicitly configured for unauthenticated protected requests. Other error codes can originate from validation, Spring Security, and service-level `ResponseStatusException`s; exact error payload shape is Spring-managed and is not separately standardized by a global exception-handler class in the inspected tree.
