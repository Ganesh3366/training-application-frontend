# SkillForge Setup Guide

This guide assumes a new Windows computer using PowerShell.

## 1. Required software

Install Git, Java 17 JDK, PostgreSQL, Node.js, and npm. The frontend declares npm `11.16.0`; the backend declares Java `17` and includes Maven Wrapper.

Verify:

```powershell
git --version
java -version
node --version
npm --version
```

You do not need to install Maven globally when using `mvnw.cmd`.

## 2. Clone the repositories

```powershell
mkdir training-application
cd training-application
git clone https://github.com/Ganesh3366/training-application-backend.git backend
git clone https://github.com/Ganesh3366/training-application-frontend.git frontend
```

## 3. Start PostgreSQL

Use the PostgreSQL Windows service, pgAdmin, or your normal PostgreSQL installation. Confirm it accepts local connections on port `5432`.

## 4. Create the database

The application configuration expects:

```text
Database: training_application
Host: localhost
Port: 5432
Username: postgres
```

Using `psql`:

```powershell
psql -U postgres
```

Then:

```sql
CREATE DATABASE training_application;
```

Exit with `\q`.

## 5. Configure backend environment variables

`DB_PASSWORD` is required because `application.properties` contains:

```properties
spring.datasource.password=${DB_PASSWORD}
```

Set it only in your local environment:

```powershell
$env:DB_PASSWORD="your_postgresql_password"
```

Optional initial admin:

```powershell
$env:APP_ADMIN_NAME="Your Admin Name"
$env:APP_ADMIN_EMAIL="admin@example.com"
$env:APP_ADMIN_PASSWORD="your_secure_admin_password"
```

Optional demo data:

```powershell
$env:SEED_DEMO_DATA="true"
```

Leave it unset or use `false` when demo data is not wanted.

Do not place real secrets in README files or commit them to Git.

## 6. Run backend tests

```powershell
cd backend
.\mvnw.cmd test
```

The full application-context test needs valid PostgreSQL credentials because the normal datasource configuration is loaded.

## 7. Run the backend

```powershell
.\mvnw.cmd spring-boot:run
```

Expected port: `8080`.

A simple verification is to open:

```text
http://localhost:8080/api/courses
```

This GET endpoint is public. A JSON response confirms the API is reachable.

## 8. Install frontend dependencies

Open another PowerShell window:

```powershell
cd path\to\training-application\frontend
npm install
```

## 9. Run the frontend

```powershell
npm start
```

The Angular development server normally becomes available at:

```text
http://localhost:4200
```

The development configuration uses `src/proxy.conf.json`, forwarding `/api/**` to `http://localhost:8080`.

## 10. Verify the full application

1. Open `http://localhost:4200`.
2. Confirm the home page and course catalogue load.
3. Use signup/login for authenticated learner flows.
4. For management/admin flows, use an account with the required backend role.
5. Verify backend console shows successful PostgreSQL connectivity rather than authentication errors.

## 11. Build frontend for production

```powershell
npm run build
```

The output is generated under the Angular `dist` directory. The project has configured initial-bundle and component-style budgets.

## 12. Default ports

| Service | Port |
|---|---:|
| Angular dev server | 4200 (Angular default) |
| Spring Boot API | 8080 |
| PostgreSQL | 5432 |

## Common setup problems

### `FATAL: password authentication failed for user "postgres"`
Set the correct `DB_PASSWORD` in the terminal that starts/tests Spring Boot.

### Environment variable appears missing
PowerShell `$env:...` values are process/session scoped. A newly opened terminal will not inherit values from an unrelated closed session unless you configured them persistently.

### Backend starts but frontend API calls fail
Check that `npm start` is using the development serve configuration and that backend port `8080` is reachable.

### Schema/tables are absent
The application uses `spring.jpa.hibernate.ddl-auto=update`. Once the correct database exists and credentials work, Hibernate manages entity-backed schema updates during application startup. No Flyway/Liquibase dependency was found in the inspected Maven configuration.
