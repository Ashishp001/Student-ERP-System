# EduPortal — Backend (Spring Boot)

## Tech Stack
- Java 17
- Spring Boot 3.2
- Spring Security 6 (JWT authentication)
- Spring Data JPA (Hibernate)
- PostgreSQL 16
- Flyway (database migrations)
- MapStruct (DTO mapping)
- SpringDoc OpenAPI (Swagger UI)

## Running Locally

### Prerequisites
- Java 17+
- PostgreSQL 16 running on `localhost:5432`
- Database `eduportal` created with user `eduportal_user`

### Run
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Swagger UI
```
http://localhost:8080/swagger-ui.html
```

## Database Migrations
Flyway migrations are in `src/main/resources/db/migration/`:
- `V1` — users table
- `V2` — student/faculty profiles
- `V3` — courses, subjects
- `V4` — assignments, submissions
- `V5` — attendance
- `V6` — internal marks, exam results
- `V7` — notices, study materials
- `V8` — grievances
- `V9` — notifications

## Environment Variables
| Variable | Default | Description |
|---|---|---|
| `DB_USERNAME` | `eduportal_user` | PostgreSQL username |
| `DB_PASSWORD` | `eduportal_pass` | PostgreSQL password |
| `JWT_SECRET` | *(in application.yml)* | JWT signing key (256-bit+) |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

## Default Admin
On first run, a seeder creates:
- **Email:** `admin@iicmr.ac.in`
- **Password:** `admin123`

## API Structure
All endpoints are prefixed with `/api/v1/`:
- `/auth/*` — Login, Register, Refresh, Change Password
- `/users/*` — Profile management
- `/admin/*` — Admin operations
- `/courses/*` — Course CRUD
- `/subjects/*` — Subject CRUD
- `/assignments/*` — Assignment lifecycle
- `/submissions/*` — Submission & grading
- `/attendance/*` — Attendance marking
- `/notices/*` — Notice board
- `/marks/*` — Internal marks
- `/materials/*` — Study materials
- `/results/*` — Exam results
- `/notifications/*` — In-app notifications
- `/grievances/*` — Grievance management
- `/analytics/*` — Dashboard analytics
