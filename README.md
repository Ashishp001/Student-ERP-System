# IICMR EduPortal — College ERP System

A production-grade college ERP web application that manages the academic lifecycle — from student enrollment and assignment management to grading, attendance tracking, and institutional analytics.

## Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS v4 + React Router 6
- **Backend:** Java 17 + Spring Boot 3.2 + Spring Security 6 + Spring Data JPA
- **Database:** PostgreSQL 16 with Flyway migrations
- **Infrastructure:** Docker + Docker Compose

## Quick Start

### Prerequisites
- Docker & Docker Compose (or Java 17 + Node.js 20 + PostgreSQL)

### With Docker
```bash
docker-compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

### Manual Setup
```bash
# Backend
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend
cd frontend
npm install
npm run dev
```

## Default Admin Account
- Email: `admin@iicmr.ac.in`
- Password: `admin123`

## Project Structure
```
eduportal/
├── backend/     # Spring Boot REST API
├── frontend/    # React SPA
└── docker-compose.yml
```

## Roles
| Role | Access |
|------|--------|
| **Student** | View assignments, submit work, check grades/attendance |
| **Faculty** | Create assignments, grade, mark attendance, upload materials |
| **Admin** | Manage users, courses, subjects, analytics, grievances |
