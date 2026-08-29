# **SkillForge AI-Assisted Development and Prompt History**

This document records the significant AI-assisted development prompts used during the development of SkillForge.

## **AI Tools Used**

\- ChatGPT — requirement analysis, architecture discussion, security review, code review, testing guidance, debugging, optimization, and preparation of focused implementation prompts.

\- OpenAI Codex — focused frontend and backend implementation.

## **1. Angular CourseService Architecture**

### **Why This Prompt Was Used**

To separate course data from the Angular "Courses" component and create a reusable service layer that could later be connected to a backend API.

### **Codex Prompt**

**Type: Reconstructed / Verbatim**

Refactor the existing Angular course implementation so that course data is owned by CourseService rather than directly by the Courses component.

#### **Requirements:**

\- Preserve the current UI and behavior.

\- Keep the Course model strongly typed.

\- Move reusable course-data access into CourseService.

\- Components should consume the service rather than own the data source.

\- Do not duplicate course data across components.

\- Keep the design ready for replacing the temporary data source with a backend API later.

\- Do not modify unrelated application functionality.

Run the relevant Angular tests/build after the change.

Do not commit or push.

### **Developer Feedback**

\- Improve readability.

\- Reduce duplicated course logic.

\- Reuse the existing service architecture.

\- Follow Angular best practices.

\- Keep the implementation simple and reusable.

### **Narrative**

The implementation was reviewed before acceptance. The developer focused on separating UI responsibilities from data access rather than keeping course data inside components.

### **Validation**

\- Course listing was checked.

\- "CourseService" usage was verified.

\- Existing Angular functionality remained working.

---

## **2. Dynamic Course Details**

### **Why This Prompt Was Used**

To support dynamic course pages through "/courses/\:id" and safely handle invalid or nonexistent course IDs.

### **Codex Prompt**

**Type: Reconstructed / Not Verbatim**

Implement dynamic Angular course-details routing using the existing route:

/courses/\:id

#### **Requirements:**

\- Read the course ID from ActivatedRoute.

\- Validate the route parameter before using it.

\- Use CourseService.getCourseById(id).

\- Do not duplicate course data.

\- Display the selected course when it exists.

\- Gracefully handle invalid, malformed, or nonexistent IDs.

\- Preserve existing routing and navigation.

\- Keep TypeScript strongly typed.

\- Do not change unrelated features.

#### **Test:**

\- valid course ID

\- nonexistent course ID

\- malformed route ID

\- navigation from Courses to Course Details

Run the Angular build.

Do not commit or push.

### **Developer Feedback**

\- Keep route handling readable.

\- Validate IDs before using them.

\- Reuse "CourseService".

\- Avoid duplicated course data.

\- Preserve existing navigation.

### **Narrative**

The developer reviewed the route behavior and required invalid URLs to fail safely instead of assuming every route ID was valid.

### **Validation**

\- Valid course IDs were tested.

\- Invalid course IDs were tested.

\- Course-not-found behavior was verified.

---

## **3. Initial Landing Page**

### **Why This Prompt Was Used**

To redesign the existing Angular landing page using a selected visual reference while preserving all existing project functionality.

### **Codex Prompt**

**Type: Exact / Verbatim**

I want you to redesign my existing Angular application's landing page to match the attached reference image as closely as possible.

Important: inspect the existing project before making any changes. Do not rebuild the application from scratch.

The existing Angular application already contains routing, authentication-related code, navigation logic, course pages, CourseService, course-details routing, Angular Material configuration, and other working functionality.

Preserve all existing business logic and working functionality.

Use only:

\- Angular

\- TypeScript

\- Angular Material

\- HTML

\- CSS

Do not add:

\- Bootstrap

\- Tailwind

\- jQuery

\- another UI framework

Preserve the existing:

\- Angular routes

\- router outlet

\- Courses page

\- Course Details page

\- /courses/\:id

\- Course model

\- CourseService

\- authentication-related code

\- role/authorization-related code

\- lazy-loaded routes

\- mobile navigation logic

Do not use the entire reference screenshot as the webpage background.

Build the page as real Angular HTML/CSS so navigation, buttons, accessibility, and responsiveness remain functional.

Before editing, inspect the current project and explain which files you intend to modify.

After implementation:

## **1. list every file changed**

## **2. explain each change**

## **3. confirm existing functionality was preserved**

## **4. run npm run build**

## **5. report any errors**

Do not commit or push anything.

### **Developer Feedback**

\- Preserve Angular best practices.

\- Keep the page responsive.

\- Review accessibility.

\- Avoid unnecessary dependencies.

\- Preserve existing routes and business logic.

### **Narrative**

The generated design was reviewed in the browser before acceptance. The developer did not allow Codex to rebuild or replace the existing application architecture.

### **Validation**

\- Landing page was checked manually.

\- Existing navigation was tested.

\- Course routes remained functional.

\- Production build was run.

---

## **4. Landing Page Reference Reproduction**

### **Why This Prompt Was Used**

To first reproduce the supplied visual reference accurately before changing the page into a more original SkillForge design.

### **Codex Prompt**

**Type: Exact / Verbatim**

I need the landing page to reproduce the attached reference image as closely as possible for this first version.

Keep the visible text, sections, layout, navigation structure, buttons, feature items, illustration composition, and overall presentation close to the reference.

Do not redesign the page based on your own preferences yet.

Build it as real Angular HTML and CSS rather than using the whole screenshot as a background image.

Preserve all existing application routes, services, authentication-related logic, course functionality, and responsive behavior.

We will customize the branding, wording, navigation, and sections after the visual reproduction is working.

Do not commit or push anything.

### **Developer Feedback**

\- Keep the first version close to the reference.

\- Do not introduce unrelated design choices.

\- Preserve responsive behavior.

\- Preserve existing Angular functionality.

### **Narrative**

The first result was treated as a visual reproduction step rather than the final design. The developer reviewed it before moving to customization.

### **Validation**

\- Layout was checked visually.

\- Navigation remained functional.

\- Existing routes were preserved.

---

## **5. Header Alignment Correction**

### **Why This Prompt Was Used**

To fix only the header alignment after the developer noticed that the navigation links were positioned too high.

### **Codex Prompt**

**Type: Exact / Verbatim**

Fix only the header alignment.

Currently Home, Courses, About, and Contact are too high.

I want the header on one horizontal line, vertically centered:

Left: SkillForge logo

Center: Home | Courses | About | Contact

Right: Log In | Sign Up

Use proper Flexbox or Grid alignment such as align-items: center.

Keep the center navigation truly centered on desktop.

Do not change the hero, illustration, colors, routes, authentication logic, or mobile behavior.

Make the smallest HTML/CSS change possible.

Do not commit or push.

### **Developer Feedback**

\- Keep the correction small.

\- Avoid duplicated CSS.

\- Preserve responsiveness.

\- Do not redesign unrelated parts of the page.

### **Narrative**

The developer identified a specific UI problem and requested a focused correction rather than allowing Codex to redesign the entire header.

### **Validation**

\- Header alignment was checked visually.

\- Navigation still worked.

\- Mobile behavior remained unchanged.

---

## **6. SkillForge Originality Customization**

### **Why This Prompt Was Used**

To make the landing page original to SkillForge after the developer felt the reference reproduction looked too similar to the source.

### **Codex Prompt**

**Type: Exact / Verbatim**

Customize the current landing page so it feels original to SkillForge, not like a copy of the reference.

Keep the existing layout, illustration, routes, authentication logic, responsive behavior, and Angular Material/CSS implementation.

Change only the visible content:

\- TRAINING PLATFORM → SKILL DEVELOPMENT PLATFORM

\- Learn. Grow. Succeed. → Learn Skills. Build Confidence.

\- Replace the hero paragraph with:

  Develop practical skills through structured courses designed to support continuous learning and professional growth.

\- Keep Explore Courses

\- Change Get Started → Start Learning

\- Change navigation to:

  Home | Courses | How It Works | Certification

\- Change feature items to:

  - Practical Learning — Develop skills through structured courses

  - Certification — Recognize completed learning achievements

  - Track Progress — Follow your learning journey

Remove the fake trusted-company logo section.

Do not change business logic, routes, services, course functionality, or authentication behavior.

Use existing real routes only.

Make the smallest safe changes.

Do not commit or push.

### **Developer Feedback**

\- Make the presentation original to SkillForge.

\- Preserve accessibility.

\- Avoid unnecessary layout changes.

\- Keep existing Angular functionality.

\- Remove fictitious branding content.

### **Narrative**

The developer did not automatically accept the reference reproduction as the final design and requested changes to make the product identity more original.

### **Validation**

\- Updated content was checked.

\- Navigation was manually tested.

\- Course routes were verified.

\- Angular production build passed.

---

## **7. REST API and PostgreSQL Integration**

### **Why This Prompt Was Used**

To replace temporary frontend course data with real Spring Boot REST API and PostgreSQL data.

### **Codex Prompt**

**Type: Reconstructed / Verbatim**

Inspect the existing SkillForge Angular frontend and Spring Boot backend before making changes.

Replace the temporary frontend course-data source with real Spring Boot REST API and PostgreSQL integration.

Use this architecture:

Angular Component

    -> CourseService

    -> Angular HttpClient

    -> Spring Boot REST Controller

    -> Service Layer

    -> Repository

    -> PostgreSQL

#### **Frontend requirements:**

\- Keep HTTP communication inside Angular services.

\- Do not make direct HTTP requests from Angular components.

\- Use strongly typed TypeScript models.

\- Preserve the existing Courses page.

\- Preserve /courses/\:id.

\- Preserve CourseService as the frontend data-access boundary.

\- Handle loading, missing-data, and API-error states safely.

#### **Backend requirements:**

\- Use REST controllers only for HTTP concerns.

\- Keep business logic inside the service layer.

\- Use repositories for PostgreSQL access.

\- Validate IDs and incoming data.

\- Return appropriate HTTP status codes.

\- Use DTOs where appropriate.

\- Do not expose persistence internals or sensitive errors.

#### **Database requirements:**

\- Load course, module, and learning-content data from PostgreSQL.

\- Do not hard-code database credentials.

\- Continue using environment variables for database secrets.

Preserve existing behavior.

Do not introduce unrelated features or packages.

Run relevant frontend and backend tests/builds.

List all changed files and explain the changes.

Do not commit or push.

### **Developer Feedback**

\- Keep Angular components separate from HTTP logic.

\- Follow controller/service/repository separation.

\- Improve reusability.

\- Reduce duplicated data-access logic.

\- Review API error handling.

\- Review performance.

\- Avoid unnecessary complexity.

### **Narrative**

The integration was reviewed as an architecture change rather than only a data-source replacement. The developer required clear frontend/backend responsibility boundaries.

### **Validation**

\- Course API data was checked.

\- Course details were verified.

\- PostgreSQL loading was tested.

\- Frontend and backend builds/tests were run.

---

## **8. PostgreSQL Secret Handling**

### **Why This Prompt Was Used**

To ensure database credentials were not stored directly in committed application configuration.

### **Codex Prompt**

**Type: Reconstructed / Not Verbatim**

Review the Spring Boot PostgreSQL configuration for safe credential handling.

#### **Requirements:**

\- Do not hard-code the PostgreSQL password.

\- Use environment variables for database credentials.

\- Keep DB\_PASSWORD and other secrets outside Git.

\- Do not log database passwords.

\- Preserve local development configuration.

\- Review application configuration for accidentally exposed secrets.

\- Do not commit generated files, IDE files, or sensitive local configuration.

Run the relevant backend tests.

Do not commit or push.

### **Developer Feedback**

\- Review security.

\- Keep secrets outside source control.

\- Avoid sensitive logging.

\- Review ".gitignore".

\- Preserve local development usability.

### **Narrative**

The developer treated configuration security as part of the implementation review rather than committing database credentials for convenience.

### **Validation**

\- "DB\_PASSWORD" environment configuration was verified.

\- Git changes were reviewed for secrets.

\- Backend tests were executed.

---

## **9. Session-Based Authentication**

### **Why This Prompt Was Used**

To implement secure server-managed authentication with Spring Security and avoid relying on frontend-only authentication.

### **Codex Prompt**

**Type: Reconstructed / Not Verbatim**

Implement secure session-based authentication for SkillForge using the existing Spring Boot and Angular architecture.

Inspect the existing authentication-related code before making changes.

#### **Backend requirements:**

\- Use Spring Security.

\- Use server-managed HTTP sessions.

\- Hash passwords using BCrypt.

\- Support:

  - USER

  - INSTRUCTOR

  - ADMIN

#### **Implement:**

\- signup

\- login

\- logout

\- /me for authenticated-user restoration

\- CSRF bootstrap/protection

#### **Security requirements:**

\- Public signup must not allow the client to choose ADMIN or INSTRUCTOR.

\- The backend must determine authenticated identity from the session.

\- Never return password hashes.

\- Never log passwords or authentication secrets.

\- Preserve CSRF protection.

\- Enforce authorization on the backend.

\- Do not create frontend-only authorization as the security boundary.

#### **Frontend requirements:**

\- Reuse one central AuthService.

\- Keep authentication state in memory.

\- Do not use localStorage for authentication.

\- Do not use sessionStorage for authentication.

\- Do not introduce JWT authentication.

\- Restore the session through /me.

\- Handle login and logout state changes correctly.

\- Protect against stale /me responses restoring an old authentication state after logout or another auth transition.

#### **Testing should cover:**

\- signup

\- login

\- invalid credentials

\- authenticated /me

\- unauthenticated /me

\- refresh/session restoration

\- logout

\- refresh after logout

\- role/authorization behavior

Preserve existing routes and course functionality.

Do not weaken CSRF protection.

Run focused and relevant full tests.

Do not commit or push.

### **Developer Feedback**

\- Review authentication security.

\- Keep authorization backend-enforced.

\- Do not use unsafe browser token storage.

\- Preserve CSRF protection.

\- Prevent privileged role selection during public signup.

\- Reduce duplicated authentication logic.

\- Review stale-response behavior.

### **Narrative**

Authentication was treated as a security-sensitive feature. The developer reviewed identity ownership, role assignment, browser storage, CSRF, and session-restoration behavior.

### **Validation**

\- Signup was tested.

\- Login was tested.

\- "/me" restoration was tested.

\- Logout was tested.

\- Refresh after logout was tested.

\- Security tests were run.

---

## **10. Auth-Protected Quizzes**

### **Why This Prompt Was Used**

To keep course learning content public while restricting quiz retrieval and submission to authenticated users.

### **Codex Prompt**

**Type: Reconstructed / Not Verbatim**

Protect the learner quiz flow using the existing SkillForge session authentication.

#### **Backend requirements:**

\- Require authentication for quiz retrieval.

\- Require authentication for quiz submission.

\- Preserve CSRF protection.

\- Do not make nested quiz endpoints accidentally public.

\- Continue enforcing quiz security on the backend.

#### **Frontend requirements:**

\- Reuse the existing AuthService.

\- Do not create another /me restoration request.

\- Do not use browser storage for authentication.

#### **Authentication pending:**

\- do not request protected quiz data

#### **Logged out:**

\- do not call the quiz API

\- keep public course/module content visible

\- show an accessible message such as "Log in to take this quiz."

#### **Logged in:**

\- load the quiz

#### **Login while remaining on the same page:**

\- load the quiz without requiring a page refresh

#### **Logout:**

\- clear quiz questions

\- clear selected answers

\- clear quiz result

\- clear submission errors

#### **Re-login:**

\- request fresh quiz state

Protect against stale HTTP responses:

\- a response started under an older authentication state must not restore protected quiz data after logout

Add focused frontend and backend tests.

Preserve existing course/module functionality.

Do not commit or push.

### **Developer Feedback**

\- Keep quiz authorization on the backend.

\- Preserve CSRF protection.

\- Avoid duplicate authentication requests.

\- Clear protected data after logout.

\- Prevent stale protected responses.

\- Keep public learning content accessible.

### **Narrative**

The developer reviewed both frontend behavior and backend authorization to ensure hiding quiz UI was not being treated as the security boundary.

### **Validation**

\- Logged-out behavior was checked.

\- Login on the same page was tested.

\- Logout clearing was verified.

\- Re-login behavior was tested.

---

## **11. Second Database-Backed Demo Quiz**

### **Why This Prompt Was Used**

To add another real PostgreSQL-backed quiz while preserving the existing Module 1 quiz.

### **Codex Prompt**

**Type: Reconstructed / Not Verbatim**

Add the second database-backed demo quiz required for Module 2.

Inspect the existing quiz entities, repositories, services, controllers, and demo seeder first.

#### **Requirements:**

\- Preserve the existing Module 1 quiz.

\- Do not replace the existing Module 1 quiz.

\- Do not duplicate existing quiz data.

\- Store the Module 2 quiz in PostgreSQL using the existing quiz model.

\- Reuse existing quiz entities, repositories, services, and APIs.

\- Preserve the existing passing-score and scoring behavior.

#### **Seeder requirements:**

\- Keep demo-data seeding safe and repeatable.

\- Do not create duplicate rows when the application starts repeatedly.

\- Do not unexpectedly delete unrelated application data.

\- Preserve the existing Module 1 demo data.

Run focused quiz tests and the relevant full backend tests.

Report all changed files.

Do not modify unrelated features.

Do not commit or push.

### **Developer Feedback**

\- Reuse existing quiz architecture.

\- Avoid duplicate seeded data.

\- Preserve existing Module 1 behavior.

\- Keep database logic maintainable.

\- Avoid unnecessary new models or services.

### **Narrative**

The developer chose database-backed quizzes so future Admin/Instructor CRUD could manage quiz content instead of depending on hard-coded Angular data.

### **Validation**

\- Database reseeding was checked.

\- Module 1 quiz was preserved.

\- Module 2 quiz was verified.

\- Backend quiz tests were run.

---

## **12. Learner Module Progress Backend**

### **Why This Prompt Was Used**

To persist quiz attempts, scores, and completion status for each authenticated learner.

### **Codex Prompt**

**Type: Reconstructed / Verbatim**

Implement persistent learner module progress in the SkillForge Spring Boot backend.

Use the authenticated Spring Security principal as the learner identity.

Do not accept a client userId for progress ownership.

Create a ModuleProgress model containing:

\- user

\- module

\- attemptsCount

\- lastScore

\- bestScore

\- completed

\- completedAt

Enforce one progress row per user/module:

UNIQUE(user\_id, module\_id)

Quiz scoring and progress persistence must be transactional.

Failed attempt:

\- increment attemptsCount

\- update lastScore

\- update bestScore only when the new score is higher

\- completed remains false unless it was already completed

Passing attempt:

\- increment attemptsCount

\- update lastScore

\- update bestScore when appropriate

\- set completed = true

\- set completedAt only on the first passing attempt

Retry after completion:

\- increment attemptsCount

\- update lastScore

\- bestScore must never decrease

\- completed must remain true

\- completedAt must remain unchanged

Invalid quiz submissions:

\- do not persist progress

\- do not modify existing progress

Provide an authenticated learner-progress endpoint.

When loading course progress:

\- include every course module

\- treat a module with no progress row as Pending

\- avoid N+1 database queries

\- use bulk progress loading where appropriate

Preserve the existing Spring Security session and CSRF behavior.

Use controller, service, repository, and DTO separation.

Add tests covering:

\- failed attempt

\- first passing attempt

\- retry after completion

\- attemptsCount

\- lastScore

\- bestScore preservation

\- completed preservation

\- completedAt preservation

\- separate users

\- invalid quiz submission

\- unauthenticated access

Run focused and full relevant backend tests.

Do not commit or push.

### **Developer Feedback**

\- Do not trust client-supplied learner identity.

\- Reduce duplicated progress logic.

\- Preserve completion after passing.

\- Preserve best score correctly.

\- Review transaction boundaries.

\- Avoid N+1 queries.

\- Improve readability and maintainability.

### **Narrative**

The developer reviewed progress as both a security and data-integrity feature. Particular attention was given to retry behavior and preventing completed modules from regressing.

### **Validation**

\- Failed attempt was tested.

\- Passing attempt was tested.

\- Retry after completion was tested.

\- Best score was checked.

\- Completion persistence was verified.

---

## **13. Learner Progress Test Strengthening**

### **Why This Prompt Was Used**

To strengthen tests after reviewing the first progress implementation and prove important retry and invalid-submission behavior directly.

### **Codex Prompt**

**Type: constructed / Verbatim**

Strengthen only the learner module-progress backend tests.

Do not redesign the production implementation.

Do not modify unrelated production behavior unless a test exposes a genuine defect.

Add direct test coverage proving:

## **1. A retry for the same user/module reuses the existing ModuleProgress row.**

## **2. A retry does not create a second progress row.**

## **3. attemptsCount increments correctly.**

## **4. lastScore records the latest valid score.**

## **5. bestScore never decreases after a lower-scoring retry.**

## **6. completed remains true after the module has already been passed.**

## **7. completedAt remains unchanged after later attempts.**

## **8. An invalid quiz submission does not create progress.**

## **9. An invalid quiz submission does not modify existing progress.**

Run the focused progress tests and the relevant full backend test suite.

Do not commit or push.

### **Developer Feedback**

\- Improve test coverage.

\- Test database-row reuse directly.

\- Verify invalid submissions do not modify progress.

\- Avoid changing production logic unless a real defect is exposed.

### **Narrative**

The developer did not rely only on the original test suite and requested stronger tests around persistence and retry edge cases.

### **Validation**

\- Focused progress tests were run.

\- Retry behavior was verified.

\- Invalid-submission behavior was verified.

---

## **14. Learner Progress Frontend**

### **Why This Prompt Was Used**

To display authenticated learner progress on Angular Course Details while preserving public course content.

### **Codex Prompt**

**Type: constructed / Verbatim**

Integrate learner module progress into the Angular Course Details flow.

Use the existing SkillForge architecture.

#### **Requirements:**

\- Create strongly typed progress models.

\- Add progress API access to the appropriate Angular service.

\- Use relative API URLs.

\- Reuse the existing AuthService.

\- Do not create duplicate /me requests.

\- Do not introduce unnecessary global state.

#### **Authentication pending:**

\- do not call the progress API

#### **Logged out:**

\- keep public course and module content visible

\- do not call the learner progress API

#### **Logged in:**

\- load the authenticated learner's progress

\- display the number of completed modules

\- display each module's completion state

#### **Logout:**

\- immediately clear learner-specific progress state

#### **Re-login:**

\- request fresh progress

#### **Stale-response protection:**

\- a request started before logout must not restore progress after logout

Match progress using moduleId.

Do not depend on array position or visible module text.

#### **Failure behavior:**

\- progress API failure must not hide public course content

\- display a small safe progress error when appropriate

Keep status information accessible.

Add focused Angular tests.

#### **Run:**

\- focused frontend tests

\- full frontend tests

\- TypeScript compilation

\- npm run build

Do not commit or push.

### **Developer Feedback**

\- Follow Angular best practices.

\- Reuse "AuthService".

\- Avoid duplicate "/me" calls.

\- Reduce duplicated component logic.

\- Keep TypeScript strongly typed.

\- Review accessibility.

\- Prevent stale learner data after logout.

\- Preserve public course content on API failure.

### **Narrative**

The developer reviewed the frontend for authentication-state reuse, accessibility, API efficiency, and stale-response behavior.

### **Validation**

\- Login progress loading was tested.

\- Logout clearing was tested.

\- Re-login was tested.

\- Progress API failure behavior was checked.

\- Frontend tests and build were run.

---

## **15. Progress Status Badges**

### **Why This Prompt Was Used**

To make module completion status easier to understand visually while preserving accessible text.

### **Codex Prompt**

**Type: Reconstructed / Not Verbatim**

Make only a focused frontend UI change for module progress status.

Display:

Completed -> green badge

Pending -> orange badge

#### **Requirements:**

\- Keep the visible words "Completed" and "Pending".

\- Do not communicate status using color alone.

\- Do not invent a new In Progress backend state.

\- Do not modify backend APIs.

\- Do not change progress calculations.

\- Do not change authentication.

\- Preserve responsive behavior.

\- Preserve accessibility.

\- Make the smallest safe HTML/CSS change.

Run the relevant frontend tests and npm run build.

Do not commit or push.

### **Developer Feedback**

\- Keep visible status text.

\- Review accessibility.

\- Avoid unnecessary backend changes.

\- Do not invent unsupported states.

\- Keep CSS simple and reusable.

### **Narrative**

The developer requested a visual improvement but kept the change aligned with the real backend domain model.

### **Validation**

\- Completed badge was checked.

\- Pending badge was checked.

\- Visible text remained accessible.

\- Frontend build was verified.

---

## **16. Certificate Backend**

### **Why This Prompt Was Used**

To generate and persist certificates after a learner completes every module in a course.

### **Codex Prompt**

**Type: Reconstructed / Not Verbatim**

Implement certificate generation in the SkillForge Spring Boot backend.

A certificate must contain:

\- participant name

\- course name

\- completion date

\- final score

\- certificate number

Persist certificates in PostgreSQL.

Use one certificate per authenticated user/course:

UNIQUE(user\_id, course\_id)

Use the authenticated Spring Security principal as the learner identity.

Do not accept a client userId.

#### **Eligibility requirements:**

\- the course must exist

\- the course must contain at least one module

\- the learner must have completed every course module

\- an incomplete learner must not receive a new certificate

#### **Final score:**

\- calculate using each completed module's bestScore

\- do not allow later lower attempts to reduce the certificate score

\- calculate the final score consistently

#### **Completion date:**

\- use the latest completedAt value among the course modules

#### **Certificate number:**

\- generate an opaque certificate identifier

\- persist it

\- do not expose the internal database ID as the certificate number

#### **Idempotency:**

\- only one certificate should exist per learner/course

\- repeated requests must return the same persisted certificate

#### **Performance:**

\- avoid N+1 progress queries

\- use efficient bulk loading where appropriate

#### **Security:**

\- derive identity only from the authenticated principal

\- do not trust client-supplied user identity

\- preserve authentication

\- preserve authorization

\- preserve CSRF behavior

\- do not expose unnecessary persistence data

Certificate creation must be transactional.

#### **Add focused:**

\- service tests

\- controller tests

\- security tests

\- PostgreSQL-backed integration tests

Run focused and full relevant backend tests.

Do not commit or push.

### **Developer Feedback**

\- Review certificate eligibility carefully.

\- Do not trust client-supplied identity.

\- Keep certificate creation idempotent.

\- Use persistent opaque certificate numbers.

\- Avoid N+1 database access.

\- Preserve transaction safety.

\- Improve readability and maintainability.

### **Narrative**

The certificate implementation was reviewed for security, data integrity, performance, eligibility, and repeat-request behavior.

### **Validation**

\- Eligibility was tested.

\- Required certificate fields were checked.

\- Repeated requests were tested.

\- Persisted certificate number was verified.

---

## **17. Certificate Lifecycle Correction**

### **Why This Prompt Was Used**

To correct a lifecycle problem discovered during review after the initial certificate implementation.

### **Codex Prompt**

**Type: Reconstructed / Not Verbatim**

Make a focused correction to the existing certificate implementation.

Do not redesign the entire certificate feature.

#### **Problem 1:**

The current implementation evaluates current course/progress eligibility before checking whether a certificate has already been issued.

A previously issued certificate must remain retrievable even if the course structure later changes.

#### **Required behavior:**

## **1. Identify the authenticated learner.**

## **2. Check whether a certificate already exists for that learner/course.**

## **3. If an existing certificate is found:**

   - return the persisted certificate immediately

   - do not re-evaluate current completion eligibility

## **4. Only when no certificate exists:**

   - evaluate the current course

   - evaluate current learner completion

   - create the certificate if eligible

#### **Problem 2:**

participantName and courseName must be immutable issuance snapshots.

When the certificate is first created:

\- persist participantName

\- persist courseName

When reading an existing certificate:

\- return the persisted participantName

\- return the persisted courseName

\- do not rebuild these values from the learner's current name

\- do not rebuild these values from the course's current title

#### **Preserve:**

\- one certificate per user/course

\- the existing certificate number

\- completion date

\- final score

\- authentication

\- authorization

\- CSRF

\- idempotency

\- the current API contract where possible

#### **Add or update tests proving:**

\- repeated requests return the same certificate number

\- an existing certificate remains retrievable after later course changes

\- participantName remains the original issuance snapshot

\- courseName remains the original issuance snapshot

\- an ineligible learner cannot create a new certificate

Run focused certificate tests and the full relevant PostgreSQL-backed backend test suite.

Do not commit or push.

### **Developer Feedback**

\- Preserve already-issued certificates.

\- Keep certificate data immutable after issuance.

\- Do not redesign unrelated certificate logic.

\- Strengthen lifecycle tests.

\- Preserve security and idempotency.

\- Keep the correction focused and maintainable.

### **Narrative**

The initial implementation passed tests, but further review identified a lifecycle problem. The developer requested a focused correction instead of accepting the first successful implementation.

### **Validation**

\- Existing certificate retrieval was tested.

\- Participant-name snapshot was checked.

\- Course-name snapshot was checked.

\- Repeated certificate requests were tested.

\- Ineligible certificate creation was checked.
