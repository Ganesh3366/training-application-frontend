# SkillForge Training Application

SkillForge is a full-stack training management and learning platform designed to support structured course delivery, learner progression, assessments, reporting, and certificate generation.

The application combines an Angular frontend with a Spring Boot backend and PostgreSQL persistence. It provides role-based experiences for learners, instructors, and administrators while maintaining clear separation between presentation, business logic, security, and data access layers.

## Key Features

### Learner Experience

- Browse available courses and review course details
- Access assigned or available learning content
- Progress through structured course modules
- Learn from text and video content
- Complete module-end multiple-choice quizzes
- Receive immediate quiz scores and pass/fail results
- Retry quizzes when the required passing score is not achieved
- Track completed and pending modules
- Monitor overall course progress
- Generate a certificate after completing all required modules

### Instructor and Management Features

- Create, update, and delete courses
- Manage course modules and learning content
- Configure quizzes, questions, answer options, and passing scores
- Review learner progress and course completion information
- Access management functionality based on assigned roles

### Administrator Features

- Create and manage users
- Update user details and roles
- Activate and deactivate user accounts
- Assign courses to learners
- Review learner assignments and progress reports
- Access administrative functionality protected by role-based authorization

## Technology Stack

### Frontend

- Angular 22
- TypeScript 6
- Angular Material
- Angular Router
- RxJS
- HTML
- CSS
- Vitest

### Backend

- Java 17
- Spring Boot 4.1.1
- Spring Web MVC
- Spring Security
- Spring Data JPA
- Bean Validation
- PostgreSQL
- Maven

## Application Architecture

SkillForge follows a layered full-stack architecture that separates user interface concerns from backend business logic and persistence.

```text
Angular Frontend
       |
       | HTTP / REST
       v
Spring Boot REST API
       |
       v
Service Layer
       |
       v
Spring Data JPA
       |
       v
PostgreSQL
```

Authentication is session-based and managed by Spring Security. Authorization is enforced using role-based access control for learner, instructor, and administrator functionality.

## Project Structure

The project is maintained as separate frontend and backend applications:

```text
training-application/
├── frontend/
└── backend/
```

The Angular frontend communicates with the Spring Boot backend through REST endpoints under the `/api` path.

During local development, Angular API requests are proxied to:

```text
http://localhost:8080
```

## Running the Application

### Backend

Ensure PostgreSQL is running and the application database is available.

Provide the database password through the `DB_PASSWORD` environment variable.

From the backend directory:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend API is available at:

```text
http://localhost:8080
```

### Frontend

From the frontend directory:

```bash
npm install
npm start
```

The Angular development application is available at:

```text
http://localhost:4200
```

## Build and Verification

Create a production frontend build with:

```bash
npm run build
```

Run the backend automated test suite with:

```powershell
.\mvnw.cmd test
```

## Documentation

Detailed technical and setup documentation is available in the `docs` directory:

- [Project Documentation](docs/01-README.md)
- [Setup Guide](docs/02-SETUP.md)
- [Architecture](docs/03-ARCHITECTURE.md)
- [Components](docs/04-COMPONENTS.md)
- [Database](docs/05-DATABASE.md)
- [API Reference](docs/06-API.md)

## Security

SkillForge includes the following security controls:

- Session-based authentication
- Spring Security authorization
- Role-based access control
- BCrypt password hashing
- CSRF protection
- Protected administration and management APIs
- Server-side request validation
- Session ID rotation after authentication

## Roles and Access

SkillForge supports three primary roles:

```text
LEARNER
INSTRUCTOR
ADMIN
```

**Learners** access course content, complete quizzes, track progress, and generate certificates after successful course completion.

**Instructors** manage courses, modules, learning content, quizzes, and learner progress reporting.

**Administrators** have instructor-level management capabilities in addition to user administration and course assignment functionality.

## Certificate Generation

A learner becomes eligible for a certificate after successfully completing all required modules in a course.

Generated certificates include:

- Participant name
- Course name
- Completion date
- Final score
- Unique certificate number

## Development Tools

- Visual Studio Code
- IntelliJ IDEA
- Git
- GitHub
- npm
- Maven
- PostgreSQL

## Project Status

The core SkillForge training application requirements have been implemented, including:

- Course and module management
- Learning content delivery
- Quiz and passing-score management
- User administration
- Course assignment
- Learner progress tracking
- Management reporting
- Authentication and authorization
- Certificate generation

For detailed implementation, setup, architecture, database, and API information, refer to the documentation available in the [`docs`](docs/) directory.
