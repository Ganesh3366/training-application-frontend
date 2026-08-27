# SkillForge AI-Assisted Development and Prompt History

This document records how AI tools are used during the development of SkillForge.

## AI Tools Used

- ChatGPT
- Codex

AI is used to support software engineering, architecture, implementation, debugging, review, testing, Git workflow, and documentation.

AI is **not** treated as the final decision-maker.

The developer remains responsible for understanding, approving, testing, modifying, and committing the submitted solution.

---

# 1. Development Principle

The main development principle for SkillForge is:

```text
AI Suggests
     |
     v
Developer Understands
     |
     v
Developer Approves or Rejects
     |
     v
Implementation
     |
     v
Developer Tests
     |
     v
Developer Decides Whether to Commit
```

A recommendation is not automatically implemented simply because AI suggested it.

The developer may:

- approve the recommendation
- reject the recommendation
- request another method
- request different terminology
- request a simpler solution
- request a more secure solution
- request a more reusable design
- ask for trade-offs
- ask for an explanation before implementation

The developer is always the final decision-maker.

---

# 2. Approval-Based Engineering Workflow

The workflow used during SkillForge development is:

```text
Developer Requirement / Idea
          |
          v
ChatGPT Requirement Analysis
          |
          v
Architecture and Design Discussion
          |
          v
Engineering Review
          |
          +--> Code Quality
          +--> Security
          +--> Reusability
          +--> Maintainability
          +--> Testing
          +--> Edge Cases
          +--> Performance
          +--> Git Impact
          |
          v
Recommended Approach
          |
          v
Developer Decision
       /       \
      /         \
 APPROVED    NOT APPROVED
    |              |
    |              v
    |        Alternative Method
    |        / Terminology /
    |        Architecture
    |              |
    |              v
    |        Developer Reviews Again
    |              |
    +--------------+
          |
          v
Implementation Plan
          |
          v
Focused Codex Prompt
(when Codex is useful)
          |
          v
Codex Implementation
          |
          v
Developer Reviews Result
          |
          v
Manual Testing
          |
          v
ChatGPT Code / Security / Git Review
          |
          v
Developer Final Decision
       /        \
      /          \
  COMMIT        REVISE
```

---

# 3. Engineering Review Before Significant Code

Before a meaningful implementation change, ChatGPT is expected to review the requirement first.

The review may include:

## Requirements

- What problem are we solving?
- Who will use the feature?
- What should happen?
- What should not happen?

## Architecture

- Which component should own the responsibility?
- Should the logic live in a component, service, backend, or database?
- Can existing code be reused?
- Will the design be easy to extend?

## Code Quality

- Strong TypeScript typing
- Clear naming
- Small responsibilities
- Avoid unnecessary duplication
- Readable code
- Appropriate separation of concerns

## Reusability

- Reuse existing models
- Reuse existing services
- Avoid copying the same data or logic into multiple components
- Create reusable code only where it provides a real benefit

## Maintainability

- Keep features easy to modify
- Avoid unnecessary complexity
- Keep components focused
- Keep data-access responsibilities separated from presentation logic

## Security

Where applicable, review:

- authentication
- authorization
- IDOR
- exposed secrets
- XSS
- injection
- unsafe storage
- input validation
- sensitive logging
- frontend-only authorization
- API access control

Frontend route visibility is not considered real security.

Authorization for protected operations must ultimately be enforced by the backend.

## Testing

Depending on the feature, validation may include:

- manual browser testing
- Angular unit tests
- component tests
- backend tests
- API tests
- integration tests
- end-to-end tests
- production build verification

## Git

Before committing:

- review changed files
- avoid unrelated files in the same commit
- use meaningful commit messages
- verify the build
- verify the working tree
- let the developer decide whether the change is ready

---

# 4. What Happens if the Developer Rejects an AI Recommendation

The developer does not have to accept the first recommendation.

Example:

```text
Developer:
"I don't approve this approach."
```

The next step should be:

```text
ChatGPT
   |
   v
Explain Another Approach
   |
   v
Explain Trade-offs
   |
   v
Developer Reviews
   |
   v
Developer Approves or Rejects Again
```

Possible alternative discussions may include:

- another implementation method
- simpler architecture
- different terminology
- different component structure
- different API design
- another security approach
- another UI design
- another data-flow design

When useful, alternatives should be compared using:

```text
Security
Complexity
Performance
Scalability
Maintainability
Reusability
Testing
Development Time
```

---

# 5. Role of ChatGPT

ChatGPT is used as a:

- senior software-engineering mentor
- solution-architecture assistant
- code reviewer
- security reviewer
- debugging assistant
- testing advisor
- Git workflow reviewer
- documentation assistant
- interview-preparation assistant
- prompt-design assistant for Codex

A typical ChatGPT workflow is:

```text
Developer Requirement
        |
        v
ChatGPT Analysis
        |
        +--> Understand requirement
        +--> Review architecture
        +--> Review security
        +--> Review reusability
        +--> Review code quality
        +--> Identify edge cases
        +--> Recommend testing
        +--> Explain trade-offs
        |
        v
Recommended Approach
        |
        v
Developer Decision
```

ChatGPT does not make the final project decision.

---

# 6. Role of Codex

Codex is primarily used for focused implementation tasks after the requirement has been discussed.

The expected workflow is:

```text
Developer Requirement
        |
        v
ChatGPT Engineering Discussion
        |
        v
Developer Approval
        |
        v
Focused Codex Prompt
        |
        v
Developer Sends Prompt to Codex
        |
        v
Codex Implementation
        |
        v
Developer Tests
```

Codex prompts are intentionally scoped.

Typical restrictions include:

```text
Modify only the required files.

Preserve existing functionality.

Do not change unrelated business logic.

Do not install unnecessary packages.

Do not commit.

Do not push.

Explain which files were changed.
```

This helps prevent an AI coding agent from making unrelated changes automatically.

---

# 7. Review of Codex-Generated Changes

Codex output is not considered complete simply because Codex reports success.

After Codex makes a change, the developer manually checks the result.

The review flow is:

```text
Codex Implementation
        |
        v
Run Application
        |
        v
Developer Tests Feature
        |
        v
Test Existing Features
        |
        v
Run Production Build
        |
        v
Inspect Git Changes
        |
        v
ChatGPT Review
        |
        v
Developer Commit Decision
```

---

# 8. SkillForge Frontend Architecture Discussion

The frontend originally contained course data directly inside the Courses component.

That created a responsibility similar to:

```text
Courses Component
     |
     +--> UI Rendering
     |
     +--> Course Data
```

The architecture was reviewed before continuing.

The recommended design was:

```text
Courses Component
       |
       v
CourseService
       |
       v
Temporary Course Data
```

The developer proceeded with this approach incrementally.

`CourseService` currently provides:

```typescript
getCourses();
```

and:

```typescript
getCourseById(id);
```

This created a single source for the current temporary course data.

---

# 9. Planned Course Architecture

The current architecture is:

```text
Angular Component
      |
      v
CourseService
      |
      v
Temporary Frontend Data
```

The planned architecture is:

```text
Angular Component
      |
      v
CourseService
      |
      v
Angular HttpClient
      |
      v
Spring Boot REST API
      |
      v
PostgreSQL
```

The intention is to replace the temporary data source later without forcing the Angular components to directly manage HTTP communication.

---

# 10. Dynamic Course Details Discussion

The application uses the route:

```text
/courses/:id
```

The design discussed was:

```text
User selects course
       |
       v
/courses/:id
       |
       v
CourseDetails
       |
       v
Read Route ID
       |
       v
CourseService.getCourseById(id)
       |
       +-------------------+
       |                   |
       v                   v
Course Found        Course Not Found
       |
       v
Display Course
```

Invalid course IDs are intentionally handled instead of assuming every URL contains a valid course.

For example:

```text
/courses/999
```

displays the course-not-found state.

---

# 11. Backend Architecture

The backend is being developed separately using Spring Boot.

The intended full-stack architecture is:

```text
Browser
   |
   v
Angular
   |
   v
Angular Services
   |
   v
HTTP / REST
   |
   v
Spring Boot Controllers
   |
   v
Service Layer
   |
   v
Data Access Layer
   |
   v
PostgreSQL
```

At the current stage, the Angular frontend is not yet connected to the Spring Boot REST API.

---

# 12. Backend Security Configuration

The PostgreSQL password is not intentionally stored directly inside committed application configuration.

The Spring Boot configuration uses an environment variable:

```properties
spring.datasource.password=${DB_PASSWORD}
```

The password is supplied through the development environment rather than being committed into Git.

Before the initial backend commit:

- `.gitignore` was reviewed
- generated files were checked
- IDE files were checked
- database configuration was reviewed
- Maven tests were executed

The backend build/test completed successfully after the required environment variable was provided.

---

# 13. Git and GitHub Workflow

Git operations are reviewed incrementally.

Commands used during development include:

```bash
git status
```

```bash
git status --short
```

```bash
git diff
```

```bash
git diff --stat
```

```bash
git diff --cached --stat
```

Changes are reviewed before commits.

The developer decides whether the current work is ready to be committed.

Documentation and feature changes may be separated when doing so produces clearer Git history.

---

# 14. Landing Page Design Decision

The developer did not like the presentation of the earlier landing page and selected a new visual reference.

The requirement was discussed with ChatGPT before Codex was used.

The developer wanted:

- a professional learning-platform appearance
- Angular Material
- custom CSS
- existing application functionality preserved
- no Bootstrap
- no Tailwind
- routes preserved
- CourseService preserved
- course-details functionality preserved
- authentication-related code preserved

The initial goal was to reproduce the reference visually first and customize it afterward.

---

# 15. Codex Prompt — Initial Landing Page

## Purpose

Create a professional landing page based on the provided visual reference while preserving the existing Angular project.

## Prompt

> I want you to redesign my existing Angular application's landing page to match the attached reference image as closely as possible.
>
> Important: inspect the existing project before making any changes. Do not rebuild the application from scratch.
>
> The existing Angular application already contains routing, authentication-related code, navigation logic, course pages, CourseService, course-details routing, Angular Material configuration, and other working functionality.
>
> Preserve all existing business logic and working functionality.
>
> Use only:
>
> - Angular
> - TypeScript
> - Angular Material
> - HTML
> - CSS
>
> Do not add:
>
> - Bootstrap
> - Tailwind
> - jQuery
> - another UI framework
>
> Preserve the existing:
>
> - Angular routes
> - router outlet
> - Courses page
> - Course Details page
> - `/courses/:id`
> - Course model
> - CourseService
> - authentication-related code
> - role/authorization-related code
> - lazy-loaded routes
> - mobile navigation logic
>
> Do not use the entire reference screenshot as the webpage background.
>
> Build the page as real Angular HTML/CSS so navigation, buttons, accessibility, and responsiveness remain functional.
>
> Before editing, inspect the current project and explain which files you intend to modify.
>
> After implementation:
>
> 1. list every file changed
> 2. explain each change
> 3. confirm existing functionality was preserved
> 4. run `npm run build`
> 5. report any errors
>
> Do not commit or push anything.

---

# 16. Codex Prompt — Reference Reproduction

## Purpose

Create the first visual version close to the supplied reference before SkillForge customization.

## Prompt

> I need the landing page to reproduce the attached reference image as closely as possible for this first version.
>
> Keep the visible text, sections, layout, navigation structure, buttons, feature items, illustration composition, and overall presentation close to the reference.
>
> Do not redesign the page based on your own preferences yet.
>
> Build it as real Angular HTML and CSS rather than using the whole screenshot as a background image.
>
> Preserve all existing application routes, services, authentication-related logic, course functionality, and responsive behavior.
>
> We will customize the branding, wording, navigation, and sections after the visual reproduction is working.
>
> Do not commit or push anything.

---

# 17. Landing Page Result Review

Codex created a dedicated Home page:

```text
src/app/pages/home/
├── home.ts
├── home.html
└── home.css
```

A dedicated component was preferred over placing the complete landing-page implementation inside the root application component.

Codex also generated a training-themed illustration.

The final project asset is:

```text
public/images/skillforge-learning-illustration.png
```

The application was opened in the browser before further changes were accepted.

---

# 18. Developer Feedback — Header Alignment

After reviewing the rendered application, the developer identified a problem.

The navigation links were positioned higher than the SkillForge branding and authentication buttons.

The developer requested a focused correction rather than redesigning the entire page.

ChatGPT converted the requirement into a short Codex prompt.

---

# 19. Codex Prompt — Header Alignment

> Fix only the header alignment.
>
> Currently `Home`, `Courses`, `About`, and `Contact` are too high.
>
> I want the header on one horizontal line, vertically centered:
>
> Left: SkillForge logo
>
> Center: Home | Courses | About | Contact
>
> Right: Log In | Sign Up
>
> Use proper Flexbox or Grid alignment such as `align-items: center`.
>
> Keep the center navigation truly centered on desktop.
>
> Do not change the hero, illustration, colors, routes, authentication logic, or mobile behavior.
>
> Make the smallest HTML/CSS change possible.
>
> Do not commit or push.

---

# 20. Developer Feedback — Originality

After the reference-based landing page was working, the developer questioned whether the design looked too much like a copy of the reference.

The developer did not blindly accept the first successful visual result.

The design was reviewed again.

The decision was made to preserve the professional layout while changing the visible content and product identity.

The product name became:

```text
SkillForge
```

The navigation and hero content were also customized.

---

# 21. Codex Prompt — SkillForge Customization

> Customize the current landing page so it feels original to SkillForge, not like a copy of the reference.
>
> Keep the existing layout, illustration, routes, authentication logic, responsive behavior, and Angular Material/CSS implementation.
>
> Change only the visible content:
>
> - `TRAINING PLATFORM` → `SKILL DEVELOPMENT PLATFORM`
> - `Learn. Grow. Succeed.` → `Learn Skills. Build Confidence.`
> - Replace the hero paragraph with:
>   `Develop practical skills through structured courses designed to support continuous learning and professional growth.`
> - Keep `Explore Courses`
> - Change `Get Started` → `Start Learning`
> - Change navigation to:
>   `Home | Courses | How It Works | Certification`
> - Change feature items to:
>   - `Practical Learning` — `Develop skills through structured courses`
>   - `Certification` — `Recognize completed learning achievements`
>   - `Track Progress` — `Follow your learning journey`
>
> Remove the fake trusted-company logo section.
>
> Do not change business logic, routes, services, course functionality, or authentication behavior.
>
> Use existing real routes only.
>
> Make the smallest safe changes.
>
> Do not commit or push.

---

# 22. Validation After Landing Page Changes

The landing-page implementation was manually tested.

The developer verified:

- SkillForge landing page loads correctly
- Home navigation works
- Courses navigation works
- Explore Courses opens the Courses page
- View Course works
- `/courses/:id` works
- selected course details display
- invalid course IDs show the course-not-found state
- How It Works navigation works
- Certification navigation works
- Log In and Sign Up frontend behavior remains available

The Angular production build was also run:

```bash
npm run build
```

The build completed successfully.

---

# 23. Landing Page Git Review

The landing-page changes were inspected before committing.

New files included:

```text
public/images/skillforge-learning-illustration.png

src/app/pages/home/home.ts
src/app/pages/home/home.html
src/app/pages/home/home.css
```

Existing Angular files modified by the feature were also reviewed.

The README was intentionally removed from the landing-page feature staging area so documentation could remain a separate development concern.

---

# 24. Developer Ownership

The developer remains responsible for SkillForge.

The developer personally:

- selected the project direction
- selected the SkillForge name
- selected the landing-page reference
- rejected the previous presentation
- reviewed the initial Codex landing page
- identified the header alignment problem
- questioned the originality of the reference reproduction
- approved the SkillForge customization direction
- tested routes manually
- tested invalid course IDs
- verified Angular builds
- reviewed Git status
- decided when code should be committed

The developer may challenge any AI recommendation.

Examples include:

```text
Why should we use this approach?
```

```text
Is there another method?
```

```text
I don't approve this.
```

```text
Can we use different terminology?
```

```text
Is this reusable?
```

```text
Is this secure?
```

```text
Should we commit this now?
```

The expected response is engineering discussion rather than automatic implementation.

---

# 25. Current Development Status

```text
SkillForge Landing Page        Implemented
Responsive Navigation          Implemented
Courses Listing                Implemented
CourseService                  Implemented
Dynamic Course Details         Implemented
Invalid Course Handling        Implemented
Angular Production Build       Passing
Spring Boot Initial Setup      Completed

REST API Integration           Not Yet Integrated
PostgreSQL Course Loading      Not Yet Integrated
Server Authentication          Not Yet Integrated
Server Authorization           Not Yet Integrated
Course Module Workflow         Not Yet Implemented
Quiz System                    Not Yet Implemented
Progress Tracking              Not Yet Implemented
Certificate Generation         Not Yet Implemented
```

---

# 26. Next Development Phase

The next major development phase is planned frontend/backend integration.

The current course data flow is:

```text
Angular Component
      |
      v
CourseService
      |
      v
Temporary Frontend Data
```

The planned flow is:

```text
Angular Component
      |
      v
CourseService
      |
      v
Angular HttpClient
      |
      v
Spring Boot REST API
      |
      v
PostgreSQL
```

Before implementing this phase, the requirements and API architecture will be discussed and approved.

---

# 27. Future AI-Assisted Development

Future meaningful development should follow the same workflow:

```text
Developer Requirement
        |
        v
ChatGPT Engineering Review
        |
        v
Developer Approval
        |
        v
Codex Implementation
(when appropriate)
        |
        v
Developer Testing
        |
        v
ChatGPT Review
        |
        v
Developer Commit Decision
```

Future prompt-history entries should record:

- the problem or requirement
- architecture discussion
- AI tool used
- important prompt
- developer approval/rejection
- implementation result
- manual validation
- code/security review
- Git decision

The goal is transparent AI-assisted engineering where the developer understands and owns the submitted solution.: