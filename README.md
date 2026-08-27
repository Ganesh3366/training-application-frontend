# SkillForge Frontend

SkillForge is a web-based training application designed to help users browse training courses, view course details, and access learning-related features.

The frontend is being developed with Angular and TypeScript using a component-based architecture. Angular Material is used for UI components, and Angular Router provides navigation between application pages.

## Current Features

- SkillForge landing page
- Responsive hero section and navigation
- Lazy-loaded Home page
- Courses listing page
- Reusable Course data model
- Centralized CourseService for course data
- Dynamic course detail pages using route parameters
- Course-not-found handling for invalid course IDs
- Lazy-loaded application routes
- Angular Material UI components

## Tech Stack

### Frontend

- Angular
- TypeScript
- HTML
- CSS
- Angular Material
- Angular Router
- Angular CLI

### Development Tools

- Visual Studio Code
- Git
- GitHub
- npm

## Project Structure

```text
frontend/
├── public/
│   └── images/
│       └── skillforge-learning-illustration.png
│
└── src/
    ├── app/
    │   ├── models/
    │   │   └── app.models.ts
    │   │
    │   ├── pages/
    │   │   ├── home/
    │   │   │   ├── home.ts
    │   │   │   ├── home.html
    │   │   │   └── home.css
    │   │   │
    │   │   ├── certification/
    │   │   ├── course-details/
    │   │   │   └── course-details.ts
    │   │   │
    │   │   ├── courses/
    │   │   │   └── courses.ts
    │   │   │
    │   │   └── how-it-works/
    │   │
    │   ├── services/
    │   │   └── course.ts
    │   │
    │   ├── app.config.ts
    │   ├── app.routes.ts
    │   ├── app.html
    │   ├── app.css
    │   └── app.ts
    │
    └── styles.scss
```

## Course Data Flow

The application currently uses a centralized `CourseService` as the source of course data.

1. `CourseService` stores the current course data.
2. The Courses page retrieves the course list from `CourseService`.
3. Each course is displayed with a View Course button.
4. Selecting a course navigates to `/courses/:id`.
5. The Course Details page reads the course ID from the route.
6. `CourseService.getCourseById()` finds the matching course.
7. The selected course details are displayed.
8. If the course ID does not exist, a course-not-found message is displayed.

## Running the Frontend

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm start
```

Then open:

```text
http://localhost:4200
```

### Production Build

```bash
npm run build
```

The production build output is generated inside the `dist/` directory.

## Current Validation

The following checks have been completed successfully:

- SkillForge landing page loads correctly
- Landing page navigation works correctly
- Explore Courses navigates to the Courses page
- Courses page loads correctly
- Course navigation works with `/courses/:id`
- Course details display the selected course
- Invalid course IDs show a course-not-found message
- Production build completes successfully

## Current Limitations

The frontend is currently under active development.

- Course data is temporarily stored in `CourseService`.
- The frontend is not yet connected to the Spring Boot REST API.
- Course data is not yet loaded from PostgreSQL.
- Frontend authentication-related UI and logic exist, but server-side authentication and authorization are not yet integrated.
- Course modules, quizzes, progress tracking, and certificate generation are not yet implemented.
- Additional automated tests will be added as development progresses.

## Next Development Phase

The next phase will focus on integrating the Angular frontend with the Spring Boot backend and gradually replacing the temporary frontend course data with data provided through REST APIs.