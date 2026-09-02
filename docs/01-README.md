# SkillForge Training Application

SkillForge is a full-stack training and course-management application. It provides public course discovery, authenticated module learning and quizzes, learner progress tracking and certificates, plus role-protected administration and instructor management features.

## Main features

- Public course catalogue and course details.
- User signup, login, session-based authentication, logout, and CSRF protection.
- Role-based access for `ADMIN`, `INSTRUCTOR`, and learner/user access.
- Admin user creation, editing, enable/disable control, and course assignment.
- Admin/Instructor course management.
- Module and text/video content management.
- Quiz, question, answer-option, and passing-score management.
- Learner module-by-module study and quiz submission.
- Quiz scoring using `round(correctAnswers * 100 / totalQuestions)` and pass/fail comparison against the configured passing score.
- Attempt count, last score, best score, and module-completion tracking.
- Course progress reporting and management learner-progress reports.
- Certificate creation after eligible course completion.

## Technology stack

### Frontend
- Angular 22
- TypeScript 6
- Angular Material / CDK
- RxJS
- SCSS/CSS
- Vitest / jsdom for frontend tests
- npm

### Backend
- Java 17
- Spring Boot 4.1.1
- Spring MVC
- Spring Data JPA / Hibernate
- Spring Security
- Jakarta Bean Validation
- PostgreSQL JDBC driver
- Maven Wrapper

### Database
- PostgreSQL
- Hibernate schema update mode (`spring.jpa.hibernate.ddl-auto=update`)

## Repositories

The application is split into two repositories:

- `training-application-frontend`
- `training-application-backend`

For a local workspace, place them side by side if desired:

```text
training-application/
├── frontend/   # training-application-frontend
└── backend/    # training-application-backend
```

## Prerequisites

Install:

- Git
- Java 17 JDK
- PostgreSQL
- Node.js compatible with the Angular 22 toolchain
- npm (the frontend declares npm 11.16.0 as its package manager)

A separate Maven installation is not required when using the included Maven Wrapper.

## Database setup

The backend expects a local PostgreSQL database named `training_application` on port `5432` and the PostgreSQL user `postgres`.

Create the database using pgAdmin or PostgreSQL tools. Example with `psql`:

```sql
CREATE DATABASE training_application;
```

The application uses Hibernate `ddl-auto=update`, so entity-backed tables are created/updated when the backend starts successfully. This project does not contain a migration framework in the inspected source.

## Environment variables

The backend reads configuration from environment variables. Never commit real passwords.

| Variable | Required | Purpose |
|---|---|---|
| `DB_PASSWORD` | Yes | Password for local PostgreSQL user `postgres` |
| `SEED_DEMO_DATA` | No | Enables optional demo data; defaults to `false` |
| `APP_ADMIN_NAME` | No | Initial administrator name |
| `APP_ADMIN_EMAIL` | No | Initial administrator email |
| `APP_ADMIN_PASSWORD` | No | Initial administrator password |

PowerShell example:

```powershell
$env:DB_PASSWORD="your_postgresql_password"
$env:SEED_DEMO_DATA="false"
$env:APP_ADMIN_NAME="Your Admin Name"
$env:APP_ADMIN_EMAIL="admin@example.com"
$env:APP_ADMIN_PASSWORD="your_secure_admin_password"
```

Environment variables set this way apply to the current PowerShell session. Set them again in a new terminal unless you configure them persistently in Windows.

## Installation

Clone both repositories:

```powershell
git clone https://github.com/Ganesh3366/training-application-backend.git backend
git clone https://github.com/Ganesh3366/training-application-frontend.git frontend
```

Install frontend dependencies:

```powershell
cd frontend
npm install
```

The backend uses Maven Wrapper, so dependencies are resolved when Maven commands run.

## Run the backend

Ensure PostgreSQL is running and `DB_PASSWORD` is set, then:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend default URL: `http://localhost:8080`

Run backend tests:

```powershell
.\mvnw.cmd test
```

## Run the frontend

In a separate terminal:

```powershell
cd frontend
npm install
npm start
```

Angular's development server normally runs at `http://localhost:4200`. The configured development proxy forwards `/api/**` requests to `http://localhost:8080`.

Production build:

```powershell
npm run build
```

## Access the application

With PostgreSQL, backend, and frontend running:

- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:8080/api/...`
- PostgreSQL: `localhost:5432`

## Application screens

Verified Angular routes include:

| Route | Screen | Access |
|---|---|---|
| `/` | Home | Public |
| `/courses` | Course catalogue | Public |
| `/courses/:id` | Course details | Public |
| `/courses/:courseId/modules/:moduleId` | Module learning | Authenticated |
| `/courses/:courseId/certificate` | Certificate | Authenticated |
| `/admin/users` | Admin user management | Admin |
| `/management/courses` | Course management | Admin / Instructor |
| `/management/courses/:courseId/modules` | Module/content management | Admin / Instructor |
| `/management/courses/:courseId/modules/:moduleId/quiz` | Quiz management | Admin / Instructor |
| `/management/reports` | Learner progress reports | Admin / Instructor |
| `/certification` | Certification information screen | Public route |

Authentication is presented through a shared authentication dialog rather than a dedicated `/login` route.

## API overview

The REST API is organized under:

- `/api/auth` — signup, login, CSRF, current user, logout
- `/api/courses` — public course/module reads and authenticated learning operations
- `/api/admin/users` — admin-only user and assignment management
- `/api/management/courses` — admin/instructor course, module, content, and quiz management
- `/api/management/reports` — admin/instructor learner reporting

See [docs/API.md](docs/API.md) for the endpoint inventory.

## Important project structure

```text
training-application/
├── backend/
│   ├── pom.xml
│   ├── mvnw.cmd
│   └── src/
│       ├── main/java/com/ganesh/training_application_backend/
│       │   ├── admin/
│       │   ├── auth/
│       │   ├── config/
│       │   ├── course/
│       │   └── reporting/
│       ├── main/resources/application.properties
│       └── test/java/...
└── frontend/
    ├── angular.json
    ├── package.json
    └── src/
        ├── app/
        │   ├── guards/
        │   ├── layouts/
        │   ├── models/
        │   ├── pages/
        │   ├── services/
        │   └── shared/
        ├── proxy.conf.json
        └── styles.scss
```

## Troubleshooting

### PostgreSQL password authentication failed

If startup/tests show `password authentication failed for user "postgres"`, verify PostgreSQL is running and set the correct password in the same terminal:

```powershell
$env:DB_PASSWORD="your_postgresql_password"
```

Then rerun the backend command.

### Database does not exist

Create a PostgreSQL database named exactly:

```text
training_application
```

### Frontend cannot reach backend

Confirm the backend is running on port `8080`. During `npm start`, Angular uses `src/proxy.conf.json` to proxy `/api/**` to that port.

### Port already in use

The configured backend port is `8080`; Angular development convention is `4200`. Stop the process using the required port or deliberately configure a different local port and update any dependent proxy configuration.

### Angular production build CSS budget warnings

The project defines component-style warning/error budgets in `angular.json`. A warning alone does not necessarily fail the build; exceeding the configured error threshold does.

## Additional documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Setup Guide](docs/SETUP.md)
- [Components](docs/COMPONENTS.md)
- [Database](docs/DATABASE.md)
