# 📄 AI Resume Analyzer — Complete Project Documentation

> **Version:** 0.0.1-SNAPSHOT &nbsp;|&nbsp; **Last Updated:** February 2026  
> **Stack:** Spring Boot 3.3 (Java 17) + React 18 (TypeScript) + MySQL 8 + Google Gemini AI

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & System Design](#2-architecture--system-design)
3. [Application Workflow](#3-application-workflow)
4. [Tech Stack & Dependencies](#4-tech-stack--dependencies)
5. [Project Structure](#5-project-structure)
6. [Database Schema](#6-database-schema)
7. [Backend — API Reference](#7-backend--api-reference)
   - [Auth API](#auth-api)
   - [User API](#user-api)
   - [Resume API](#resume-api)
   - [Analysis API](#analysis-api)
   - [Jobs API](#jobs-api)
8. [Backend — File-by-File Reference](#8-backend--file-by-file-reference)
   - [Models](#models)
   - [DTOs](#dtos)
   - [Repositories](#repositories)
   - [Services](#services)
   - [Controllers](#controllers)
   - [Security (Config + Filter + Util)](#security-config--filter--util)
9. [Frontend — Pages & Components](#9-frontend--pages--components)
10. [Frontend — Services (api.ts)](#10-frontend--services-apits)
11. [Configuration Reference](#11-configuration-reference)
12. [Security Architecture](#12-security-architecture)
13. [How to Run Locally](#13-how-to-run-locally)
14. [Environment Variables & Secrets](#14-environment-variables--secrets)
15. [Known Issues & TODOs](#15-known-issues--todos)

---

## 1. Project Overview

**AI Resume Analyzer** is a full-stack web application that uses Google Gemini AI to evaluate how well a candidate's resume matches a given job description. It generates an ATS-style match score, highlights strengths, missing skills, and actionable improvement suggestions.

### Core Features

| Feature | Description |
|---|---|
| 🔐 User Authentication | JWT-based login & registration |
| 📄 Resume Upload | Upload PDF/DOCX resumes; text is extracted via Apache Tika |
| 🤖 AI Analysis | Google Gemini 2.5 Flash compares resume vs. job description |
| 📊 Match Score | 0-100 score + strengths, gaps and suggestions |
| 💼 Job Feed | Live remote job listings from RemoteOK, personalised by user skills |
| 🗂️ History | View and delete past resume uploads and analyses |
| 👤 Profile | Update name, headline, job title, skills, location, website |

---

## 2. Architecture & System Design

```
┌────────────────────────────────────────┐
│           Browser (React SPA)          │
│  - Vite + TypeScript + Tailwind CSS    │
│  - JWT stored in localStorage          │
│  - Axios with Bearer token interceptor │
└──────────────┬─────────────────────────┘
               │ HTTP/REST (port 5173 → 8080)
               ▼
┌────────────────────────────────────────┐
│      Spring Boot REST API (8080)       │
│  - Spring Security (Stateless JWT)     │
│  - Spring Data JPA (Hibernate)         │
│  - Apache Tika (text extraction)       │
│  - RestTemplate (Gemini + RemoteOK)    │
└──────┬──────────────────┬──────────────┘
       │                  │
       ▼                  ▼
┌────────────┐   ┌─────────────────────┐
│  MySQL 8   │   │  External APIs       │
│  Database  │   │  - Google Gemini AI  │
│  (port     │   │  - RemoteOK Jobs API │
│   3306)    │   └─────────────────────┘
└────────────┘
```

### Request Lifecycle (Analysis)

```
1. User uploads resume → POST /api/resume/upload
   └─ File saved to ./uploads/
   └─ Apache Tika extracts plain text
   └─ Resume entity saved (MySQL: resumes table)

2. User submits job description → POST /api/analyze/{resumeId}
   └─ Backend fetches extracted text from DB
   └─ Constructs prompt → POST to Gemini API
   └─ Response JSON parsed (score, skills, etc.)
   └─ Analysis entity saved (MySQL: analyses table)
   └─ Analysis returned to frontend

3. Frontend parses JSON result and renders:
   └─ Circular score indicator
   └─ Strengths list
   └─ Missing skills list
   └─ Improvement suggestions
```

---

## 3. Application Workflow

### New User Registration

```
[Browser]                [Backend]             [Database]
   │                        │                       │
   ├── POST /api/auth/register ──────────────────>  │
   │   { name, email, password }                    │
   │                        │── Check email unique ─>│
   │                        │<─ (not found = OK) ────│
   │                        │── BCrypt hash pwd      │
   │                        │── Save User ──────────>│
   │<─ 200 "registered" ────│                       │
```

### Login Flow

```
[Browser]                [Backend]                  [JWT]
   │                        │                         │
   ├── POST /api/auth/login ──────────────────────>   │
   │   { email, password }                            │
   │                        │── AuthManager.auth()    │
   │                        │── validate BCrypt hash  │
   │                        │── JwtUtil.generateToken() ─>
   │<─ { token: "eyJ..." } ─│<─────────────────────── │
   │── Store token in localStorage                    │
   │── All subsequent requests: Authorization: Bearer <token>
```

### Resume Analysis Flow

```
USER                 FRONTEND              BACKEND             GEMINI
 │                      │                     │                   │
 ├── Upload resume.pdf ──>                     │                   │
 │                      ├── POST /api/resume/upload               │
 │                      │                     │── Tika extract    │
 │                      │                     │── Save to MySQL   │
 │                      │<── { id, fileName } ─┤                   │
 │                      │                     │                   │
 ├── Paste job desc. ───>                     │                   │
 ├── Click Analyze ──────>                    │                   │
 │                      ├── POST /api/analyze/{id}               │
 │                      │   { jobDescription }│                   │
 │                      │                     ├── Build prompt    │
 │                      │                     ├── POST Gemini API ─>
 │                      │                     │                   │
 │                      │                     │<── JSON response ──┤
 │                      │                     │── Parse score, etc│
 │                      │                     │── Save Analysis   │
 │                      │<── Analysis result ──┤                   │
 │<── Display score, strengths, gaps, suggestions                 │
```

---

## 4. Tech Stack & Dependencies

### Backend (`pom.xml`)

| Dependency | Version | Purpose |
|---|---|---|
| `spring-boot-starter-web` | 3.3.0 | REST API, HTTP server (Tomcat) |
| `spring-boot-starter-security` | 3.3.0 | Authentication & authorisation |
| `spring-boot-starter-data-jpa` | 3.3.0 | ORM via Hibernate |
| `spring-boot-starter-validation` | 3.3.0 | Bean Validation (`@Valid`) |
| `spring-cloud-starter-openfeign` | 2023.0.2 | Declarative HTTP client (available) |
| `mysql-connector-j` | latest | MySQL JDBC driver |
| `jjwt-api` + `jjwt-impl` + `jjwt-jackson` | 0.11.5 | JWT creation & validation |
| `tika-core` + `tika-parsers-standard-package` | 2.9.2 | Resume text extraction (PDF, DOCX, DOC) |
| `spring-boot-starter-test` | 3.3.0 | JUnit + Mockito (test scope) |
| `spring-security-test` | 3.3.0 | Security integration tests |

### Frontend (`package.json`)

| Package | Purpose |
|---|---|
| `react` + `react-dom` | UI framework |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client with interceptors |
| `lucide-react` | Icon library |
| `typescript` | Static typing |
| `vite` | Build tool & dev server |
| `tailwindcss` | Utility-first CSS |

### External APIs

| API | Used For | Endpoint |
|---|---|---|
| **Google Gemini 2.5 Flash** | Resume analysis | `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent` |
| **RemoteOK** | Job listings feed | `https://remoteok.com/api` |

---

## 5. Project Structure

```
airesumeanalyzer/
├── pom.xml                                    # Maven build definition
├── mvnw / mvnw.cmd                            # Maven wrapper scripts
├── src/
│   └── main/
│       ├── java/com/airesumeanalyzer/airesumeanalyzer/
│       │   ├── AiresumeanalyzerApplication.java   # Entry point (@SpringBootApplication)
│       │   ├── config/
│       │   │   └── SecurityConfig.java            # Spring Security configuration
│       │   ├── controller/
│       │   │   ├── AuthController.java             # POST /api/auth/login, /register
│       │   │   ├── UserController.java             # GET/PUT /api/user/profile
│       │   │   ├── ResumeController.java           # POST/GET/DELETE /api/resume/*
│       │   │   ├── AnalysisController.java         # POST/GET/DELETE /api/analyze/*
│       │   │   └── JobController.java              # GET /api/jobs
│       │   ├── dto/
│       │   │   ├── AuthRequest.java                # Login request payload
│       │   │   ├── AuthResponse.java               # Login response (token)
│       │   │   ├── RegisterRequest.java            # Register request payload
│       │   │   ├── AnalysisRequest.java            # Analysis request (jobDescription)
│       │   │   ├── JobDTO.java                     # Job listing data transfer object
│       │   │   └── UserProfileDTO.java             # Profile update payload
│       │   ├── filter/
│       │   │   └── JwtAuthenticationFilter.java    # JWT validation per-request filter
│       │   ├── model/
│       │   │   ├── User.java                       # JPA entity: users table
│       │   │   ├── Resume.java                     # JPA entity: resumes table
│       │   │   └── Analysis.java                   # JPA entity: analyses table
│       │   ├── repository/
│       │   │   ├── UserRepository.java             # JPA repo for User
│       │   │   ├── ResumeRepository.java           # JPA repo for Resume
│       │   │   └── AnalysisRepository.java         # JPA repo for Analysis
│       │   ├── service/
│       │   │   ├── CustomUserDetailsService.java   # Spring Security UserDetailsService
│       │   │   ├── UserService.java                # User CRUD operations
│       │   │   ├── ResumeService.java              # Resume upload + Tika parsing
│       │   │   ├── GeminiService.java              # Gemini API integration
│       │   │   ├── JobService.java                 # RemoteOK job fetch + match scoring
│       │   │   ├── FileSystemStorageService.java   # File serving utility
│       │   │   └── StorageService.java             # Storage interface
│       │   └── util/
│       │       └── JwtUtil.java                    # JWT generate/validate utilities
│       └── resources/
│           └── application.properties             # All configuration (DB, JWT, Gemini)
│
├── uploads/                                   # Runtime: saved resume files
│
└── frontend/                                  # React SPA
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.tsx                           # React entry point
        ├── App.tsx                            # Router, ProtectedRoute, PublicRoute
        ├── index.css                          # Global styles + Tailwind base
        ├── context/
        │   └── AuthContext.tsx               # Global auth state (isAuthenticated, login, logout)
        ├── components/
        │   └── Navbar.tsx                    # Fixed top navbar with active links
        ├── pages/
        │   ├── LandingPage.tsx               # Public home page
        │   ├── AuthPage.tsx                  # Login + Register page
        │   ├── DashboardPage.tsx             # Profile editor + resume upload
        │   ├── AnalysisPage.tsx              # Resume analysis tool
        │   ├── HistoryPage.tsx               # Past resume history
        │   └── JobFeedPage.tsx               # Job listings feed
        └── services/
            └── api.ts                        # All Axios API calls (authService, userApi, etc.)
```

---

## 6. Database Schema

> Auto-managed by Hibernate (`spring.jpa.hibernate.ddl-auto=update`).  
> MySQL database: `airesumeanalyzer`

### `users` Table

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique user ID |
| `name` | VARCHAR(255) | NOT NULL | Full name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login identifier |
| `password` | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| `headline` | VARCHAR(255) | nullable | Professional headline |
| `current_job_title` | VARCHAR(255) | nullable | Job title |
| `about` | VARCHAR(1000) | nullable | Bio / summary |
| `location` | VARCHAR(255) | nullable | City, Country |
| `website` | VARCHAR(255) | nullable | Portfolio/LinkedIn URL |
| `profile_picture_url` | VARCHAR(255) | nullable | Avatar image URL |
| `resume_url` | VARCHAR(255) | nullable | Download URL of latest resume |

### `user_skills` Table (join table for `@ElementCollection`)

| Column | Type | Description |
|---|---|---|
| `user_id` | BIGINT (FK → users) | Owner |
| `skills` | VARCHAR(255) | Individual skill string |

### `resumes` Table

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique resume ID |
| `user_id` | BIGINT | FK → users.id, NOT NULL | Owning user |
| `file_name` | VARCHAR(255) | NOT NULL | Original file name |
| `extracted_text` | LONGTEXT | nullable | Plain text extracted by Tika |

### `analyses` Table

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique analysis ID |
| `resume_id` | BIGINT | FK → resumes.id, NOT NULL | Analysed resume |
| `job_description` | LONGTEXT | nullable | Input job description |
| `score` | DOUBLE | nullable | Match score (0–100) |
| `result` | LONGTEXT | nullable | Full Gemini JSON response |
| `created_at` | DATETIME | auto-set by `@PrePersist` | Timestamp |

### Entity Relationships

```
User ──< Resume ──< Analysis
         (1:N)      (1:N)
```

---

## 7. Backend — API Reference

> **Base URL:** `http://localhost:8080/api`  
> **Auth:** All endpoints except `/api/auth/**` require `Authorization: Bearer <JWT_TOKEN>`

---

### Auth API

#### `POST /api/auth/register`

Registers a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Responses:**

| Status | Body | Condition |
|---|---|---|
| `200 OK` | `"User registered successfully"` | Success |
| `400 Bad Request` | `"Email already exists"` | Duplicate email |

---

#### `POST /api/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2..."
}
```

| Status | Condition |
|---|---|
| `200 OK` | Valid credentials |
| `403 Forbidden` | Invalid credentials |

---

### User API

#### `GET /api/user/profile`

Returns the authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "headline": "Senior Software Engineer",
  "currentJobTitle": "Software Developer",
  "about": "Experienced developer...",
  "skills": ["Java", "React", "Spring Boot"],
  "location": "Bangalore, India",
  "website": "https://johndoe.dev",
  "resumeUrl": "http://localhost:8080/api/resume/uploads/uuid_resume.pdf"
}
```

---

#### `PUT /api/user/profile`

Updates the authenticated user's profile.

**Request Body (all fields optional):**
```json
{
  "name": "John Doe",
  "headline": "Full Stack Developer",
  "currentJobTitle": "Lead Engineer",
  "about": "I build scalable web applications...",
  "skills": ["React", "Java", "MySQL"],
  "location": "Mumbai, India",
  "website": "https://portfolio.com",
  "profilePictureUrl": "https://cdn.example.com/pic.jpg"
}
```

**Response:** Updated `User` object (200 OK)

---

### Resume API

#### `POST /api/resume/upload`

Uploads a resume file. The backend:
1. Saves the file to `./uploads/` with a UUID prefix
2. Extracts plain text using Apache Tika
3. Saves the `Resume` entity to the database
4. Updates the user's `resumeUrl` field

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Form Field:** `file` — the resume file (PDF, DOC, DOCX, max 5 MB)

**Response:**
```json
{
  "id": 3,
  "fileName": "my_resume.pdf",
  "extractedText": "John Doe\nSoftware Engineer\n..."
}
```

| Status | Condition |
|---|---|
| `200 OK` | Upload and parse successful |
| `400 Bad Request` | Parse error or invalid file |

---

#### `GET /api/resume/my-resumes`

Returns all resumes uploaded by the authenticated user.

**Response:** Array of `Resume` objects.

---

#### `DELETE /api/resume/{id}`

Deletes a resume by its ID.

**Path Parameter:** `id` — Resume ID

**Response:** `200 OK` (empty body)

---

#### `GET /api/resume/uploads/{filename}`

Serves/downloads a resume file by its stored filename.

**Response:** File download with `Content-Disposition: attachment` header.

---

### Analysis API

#### `POST /api/analyze/{resumeId}`

Runs AI analysis of the resume against a job description using Google Gemini.

**Path Parameter:** `resumeId` — ID of the resume to analyse.

**Request Body:**
```json
{
  "jobDescription": "We are looking for a Senior React Developer with 5+ years of experience..."
}
```

**What happens internally:**
1. Resume extracted text is fetched from DB
2. A structured prompt is sent to Gemini API
3. The JSON response is parsed and saved
4. The `Analysis` entity (including score) is returned

**Response:**
```json
{
  "id": 7,
  "score": 78.0,
  "jobDescription": "...",
  "result": "{\"score\":78,\"missing_skills\":[\"Docker\",\"Kubernetes\"],\"strengths\":[\"React\",\"TypeScript\"],\"suggestions\":\"Consider adding cloud deployment experience...\"}",
  "createdAt": "2026-02-19T12:30:00"
}
```

| Status | Condition |
|---|---|
| `200 OK` | Analysis successful |
| `500 Internal Server Error` | Gemini API error or resume not found |

---

#### `GET /api/analyze/history/{resumeId}`

Returns all analyses for a specific resume.

**Response:** Array of `Analysis` objects.

---

#### `DELETE /api/analyze/{id}`

Deletes a specific analysis by its ID.

**Response:** `200 OK`

---

### Jobs API

#### `GET /api/jobs`

Fetches live remote job listings from RemoteOK and personalises them with a match score based on the authenticated user's skills.

**How personalisation works:**
1. The user's skill list is fetched from their profile
2. Each job's tags are compared to user skills (case-insensitive substring match)
3. Match score = `(matched_skills / total_user_skills) × 100`
4. Jobs are sorted by match score descending

**Response:** Array of job objects:
```json
[
  {
    "id": "12345",
    "position": "Senior React Developer",
    "company": "Acme Corp",
    "company_logo": "https://...",
    "location": "Remote",
    "tags": ["react", "typescript", "node"],
    "description": "We are looking for...",
    "url": "https://remoteok.com/jobs/12345",
    "date": "2026-02-18T10:30:00",
    "matchScore": 85
  }
]
```

---

## 8. Backend — File-by-File Reference

### Models

#### `User.java`
**Package:** `com.airesumeanalyzer.airesumeanalyzer.model`  
**Table:** `users`

JPA entity representing an application user. Key annotations:
- `@Entity`, `@Table(name = "users")`
- `@Id @GeneratedValue(strategy = AUTO)` — auto-increment PK
- `@Column(unique = true)` — email uniqueness enforced at DB level
- `@ElementCollection` on `skills` — creates `user_skills` join table

**Fields:** `id`, `name`, `email`, `password`, `headline`, `currentJobTitle`, `about`, `skills`, `location`, `website`, `profilePictureUrl`, `resumeUrl`

---

#### `Resume.java`
**Table:** `resumes`

Represents an uploaded resume file.

- `@ManyToOne` → `User` (many resumes per user)
- `@Lob @Column(columnDefinition="LONGTEXT")` — stores full extracted text without truncation

**Fields:** `id`, `user`, `fileName`, `extractedText`

---

#### `Analysis.java`
**Table:** `analyses`

Stores an AI analysis result.

- `@ManyToOne(fetch = LAZY)` → `Resume`
- `@PrePersist` — auto-sets `createdAt` on insert
- `result` stored as raw JSON string (LONGTEXT)
- `score` stored as DOUBLE for sorting/filtering

**Fields:** `id`, `resume`, `jobDescription`, `score`, `result`, `createdAt`

---

### DTOs

| Class | Purpose | Fields |
|---|---|---|
| `AuthRequest` | Login payload | `email`, `password` |
| `RegisterRequest` | Register payload | `name`, `email`, `password` |
| `AuthResponse` | Login response | `token` |
| `AnalysisRequest` | Analysis trigger | `jobDescription` |
| `UserProfileDTO` | Profile update | `name`, `headline`, `currentJobTitle`, `about`, `skills`, `location`, `website`, `profilePictureUrl` |
| `JobDTO` | RemoteOK job item | `id`, `position`, `company`, `company_logo`, `location`, `tags`, `description`, `url`, `date`, `matchScore` (+ slug, etc.) |

---

### Repositories

All extend `JpaRepository<Entity, Long>` providing CRUD operations.

#### `UserRepository`
```java
Optional<User> findByEmail(String email);
boolean existsByEmail(String email);
```

#### `ResumeRepository`
```java
List<Resume> findByUserId(Long userId);
```

#### `AnalysisRepository`
```java
List<Analysis> findByResumeId(Long resumeId);
```

---

### Services

#### `UserService`

| Method | Parameters | Returns | Description |
|---|---|---|---|
| `getUserByEmail` | `String email` | `User` | Fetches user or throws RuntimeException |
| `updateUserProfile` | `String email, UserProfileDTO dto` | `User` | Partially updates profile fields (null-safe) |
| `updateResumeUrl` | `String email, String resumeUrl` | `void` | Updates `user.resumeUrl` after upload |

---

#### `ResumeService`

| Method | Parameters | Returns | Description |
|---|---|---|---|
| `storeResume` | `MultipartFile file, User user` | `Resume` | Saves file to `./uploads/`, extracts text, persists entity |
| `parseResumeText` | `Path filePath` | `String` | Uses Apache Tika to extract text (private) |
| `getResumesByUser` | `User user` | `List<Resume>` | All resumes for a user |
| `getResumeById` | `Long id` | `Resume` | Fetches by ID or throws |
| `deleteResume` | `Long id` | `void` | Deletes resume entity |

**File storage:** Files saved as `{UUID}_{originalName}` inside `./uploads/` (relative to working directory).

---

#### `GeminiService`

| Method | Parameters | Returns | Description |
|---|---|---|---|
| `analyzeResume` | `String resumeText, String jobDescription` | `String` (JSON) | Calls Gemini API and returns parsed JSON string |

**Prompt structure sent to Gemini:**
```
You are an AI Resume Analyzer. Analyze the following resume against the job description.

Resume Text: [extracted resume text]

Job Description: [user-provided job description]

Return the response in the following JSON format ONLY:
{
  "score": <0-100>,
  "missing_skills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "suggestions": "<improvement text>"
}
```

**Post-processing:** Strips markdown code fences (` ```json ` / ` ``` `) from response before returning.

---

#### `JobService`

| Method | Parameters | Returns | Description |
|---|---|---|---|
| `fetchJobs` | `String email` | `List<JobDTO>` | Fetches RemoteOK jobs, scores vs. user skills, sorts |
| `calculateMatchScores` | `List<JobDTO>, List<String> skills` | `void` | Sets `matchScore` on each job (private) |

**Match scoring algorithm:**
```
matchScore = (count of user skills that appear in job tags) / (total user skills) × 100
```

---

#### `CustomUserDetailsService`

Implements `UserDetailsService` for Spring Security.

| Method | Returns | Description |
|---|---|---|
| `loadUserByUsername(String email)` | `UserDetails` | Loads user from DB; wraps in Spring's `User` object |

---

#### `FileSystemStorageService` / `StorageService`

`StorageService` is an interface; `FileSystemStorageService` implements it.

| Method | Description |
|---|---|
| `loadAsResource(String filename)` | Returns a `Resource` for file download |

---

### Controllers

#### `AuthController` — `/api/auth`

| Method | Endpoint | Auth Required |
|---|---|---|
| POST | `/register` | ❌ Public |
| POST | `/login` | ❌ Public |

---

#### `UserController` — `/api/user`

| Method | Endpoint | Auth Required |
|---|---|---|
| GET | `/profile` | ✅ JWT |
| PUT | `/profile` | ✅ JWT |

Extracts user email from `SecurityContextHolder.getContext().getAuthentication().getName()`.

---

#### `ResumeController` — `/api/resume`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/upload` | ✅ JWT | Upload file (multipart) |
| GET | `/my-resumes` | ✅ JWT | Get all user resumes |
| DELETE | `/{id}` | ✅ JWT | Delete a resume |
| GET | `/uploads/{filename}` | ✅ JWT | Serve file download |

---

#### `AnalysisController` — `/api/analyze`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/{resumeId}` | ✅ JWT | Trigger AI analysis |
| GET | `/history/{resumeId}` | ✅ JWT | Get analysis history |
| DELETE | `/{id}` | ✅ JWT | Delete an analysis |

---

#### `JobController` — `/api/jobs`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/` | ✅ JWT | Personalised job feed |

---

### Security (Config + Filter + Util)

#### `SecurityConfig`

Configures Spring Security:
- **CSRF**: Disabled (stateless JWT API)
- **CORS**: All origins `*`, methods GET/POST/PUT/DELETE/OPTIONS, headers Authorization + Content-Type
- **Public paths**: `/api/auth/**` (login + register)
- **All other paths**: require valid JWT
- **Session**: `STATELESS` — no server-side session
- **Filter**: `JwtAuthenticationFilter` runs before `UsernamePasswordAuthenticationFilter`
- **Password**: `BCryptPasswordEncoder`

---

#### `JwtAuthenticationFilter`

Extends `OncePerRequestFilter`. On every request:

```
1. Extract "Authorization" header
2. If missing or not "Bearer ..." → skip (pass to next filter)
3. Extract JWT from header
4. Extract username (email) from JWT
5. Load UserDetails from CustomUserDetailsService
6. Validate token (email matches + not expired)
7. Set Authentication in SecurityContextHolder
```

---

#### `JwtUtil`

| Method | Returns | Description |
|---|---|---|
| `generateToken(String username)` | `String` | Creates signed JWT with subject = email |
| `validateToken(String token, String username)` | `Boolean` | Checks subject match + expiry |
| `extractUsername(String token)` | `String` | Reads `sub` claim |

**Algorithm:** HMAC-SHA256 (`HS256`)  
**Expiry:** `jwt.expiration` ms from `application.properties` (default: 86400000 = 24 hours)  
**Secret:** Hex-encoded string, decoded to bytes via `BASE64`

---

## 9. Frontend — Pages & Components

### Route Map

| Path | Component | Auth Required | Description |
|---|---|---|---|
| `/` | `LandingPage` | ❌ | Public marketing page |
| `/login` | `AuthPage` (type="login") | ❌ (redirect to /dashboard if logged in) | Login form |
| `/register` | `AuthPage` (type="register") | ❌ (redirect if logged in) | Registration form |
| `/dashboard` | `DashboardPage` | ✅ | Profile editor + resume upload |
| `/analyze` | `AnalysisPage` | ✅ | Resume analysis tool |
| `/history` | `HistoryPage` | ✅ | Past resume records |
| `/jobs` | `JobFeedPage` | ✅ | Personalised job feed |

### Route Guards

```tsx
// ProtectedRoute — unauthenticated users sent to /login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// PublicRoute — authenticated users sent to /dashboard
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};
```

---

### `AuthContext.tsx`

Global authentication state via React Context API.

**Provides:**

| Value | Type | Description |
|---|---|---|
| `isAuthenticated` | `boolean` | True when JWT token exists in localStorage |
| `login(token)` | `function` | Saves token to localStorage, sets `isAuthenticated = true` |
| `logout()` | `function` | Removes token from localStorage, sets `isAuthenticated = false` |

**Initialisation:** On mount, checks `localStorage.getItem('token')` — if present, sets `isAuthenticated = true`. This preserves session across page refreshes.

---

### `Navbar.tsx`

Fixed top navigation bar.

- **Active link highlighting** via `useLocation()` — current route gets `text-white` class
- **Authenticated links:** Dashboard | Job Feed | Analyze | History | Logout
- **Unauthenticated links:** Login | Get Started
- **Mobile hamburger menu** — toggle on small screens (`sm:hidden` / `hidden sm:flex`)

---

### `LandingPage.tsx`

Public marketing page with:
- Hero section (headline, CTA buttons, social proof bar)
- 6-card feature grid (`AI Analysis`, `ATS Score`, `Actionable Suggestions`, `Job Feed`, `Resume Vault`, `Private & Secure`)
- CTA section with conditional button (Analyze if logged in, Register if not)

---

### `AuthPage.tsx`

Shared login + registration form. Controlled by `type` prop.

- On login success → calls `authContext.login(token)` → redirects to `/dashboard`
- On register success → auto-redirects to `/login`
- Displays inline error messages

---

### `DashboardPage.tsx`

Two-tab interface:

**Tab 1: Profile Details**
- Fields: Name, Headline, Current Role, Location, Website, About Me, Skills (comma-separated)
- On save → `PUT /api/user/profile`

**Tab 2: Resume Upload**
- Shows current resume status (green "Resume Active" card if `resumeUrl` exists)
- File picker (PDF, DOC, DOCX, max 5 MB)
- Upload button → `POST /api/resume/upload`

---

### `AnalysisPage.tsx`

Two-step form:

1. **Select resume** from dropdown (fetched via `GET /api/resume/my-resumes`)
2. **Paste job description** in textarea
3. Click **Analyze** → `POST /api/analyze/{resumeId}`

**Results display:**
- Circular score indicator (0-100)
- Strengths section
- Missing skills section
- Improvement suggestions

---

### `HistoryPage.tsx`

Displays all resumes of the authenticated user.

- Fetched via `GET /api/resume/my-resumes`
- Each row shows filename + upload date
- Delete button → `DELETE /api/resume/{id}` with confirmation dialog

---

### `JobFeedPage.tsx`

Rich job listing feed with:

**Controls:**
- Live search (filters by role, company, location, skill tag)
- Filter tabs: All / Full-time / Contract / Remote / Part-time
- Sort: Best Match (default) / Newest

**Per-card features:**
- Company logo (with fallback to UI Avatars initials)
- Position + Match Score badge (green/yellow/grey)
- Company name, location, salary range, job type, experience, posted date
- Skill tags
- "Top Pick for You" ribbon on the best match job
- Bookmark/Save toggle button
- "Apply Now" external link

---

## 10. Frontend — Services (`api.ts`)

Central Axios API configuration. All calls automatically attach the JWT token via a **request interceptor**.

```typescript
const API_URL = 'http://localhost:8080/api';

// Interceptor: auto-attach Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### `authService`

| Method | Parameters | Backend Call | Description |
|---|---|---|---|
| `login(email, password)` | string, string | `POST /api/auth/login` | Login; stores token to localStorage |
| `register(name, email, pwd)` | string × 3 | `POST /api/auth/register` | Register new account |
| `logout()` | — | — | Removes token from localStorage |
| `getCurrentUser()` | — | — | Returns token from localStorage (or null) |

### `userApi`

| Method | Backend Call | Description |
|---|---|---|
| `getProfile()` | `GET /api/user/profile` | Fetches user profile object |
| `updateProfile(data)` | `PUT /api/user/profile` | Updates profile fields |

### `resumeService`

| Method | Backend Call | Description |
|---|---|---|
| `uploadResume(file: File)` | `POST /api/resume/upload` | Multipart file upload |
| `getMyResumes()` | `GET /api/resume/my-resumes` | All user resumes |
| `deleteResume(id: number)` | `DELETE /api/resume/{id}` | Delete resume |

### `analysisService`

| Method | Backend Call | Description |
|---|---|---|
| `analyzeResume(resumeId, jobDesc)` | `POST /api/analyze/{resumeId}` | Trigger AI analysis |
| `getAnalysisHistory(resumeId)` | `GET /api/analyze/history/{resumeId}` | Analysis history |
| `deleteAnalysis(id)` | `DELETE /api/analyze/{id}` | Delete analysis |

### `jobApi`

| Method | Backend Call | Description |
|---|---|---|
| `getJobs()` | `GET /api/jobs` | Personalised job feed |

---

## 11. Configuration Reference

**File:** `src/main/resources/application.properties`

| Property | Value | Description |
|---|---|---|
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/airesumeanalyzer?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC` | MySQL connection URL |
| `spring.datasource.username` | `root` | DB username |
| `spring.datasource.password` | `[your password]` | DB password |
| `spring.jpa.hibernate.ddl-auto` | `update` | Auto creates/alters tables on startup |
| `spring.jpa.show-sql` | `true` | Logs all SQL queries to console |
| `spring.servlet.multipart.max-file-size` | `5MB` | Max resume upload size |
| `spring.servlet.multipart.max-request-size` | `5MB` | Max total request size |
| `jwt.secret` | `[hex string]` | HMAC-SHA256 signing key for JWT |
| `jwt.expiration` | `86400000` | Token lifetime: 24 hours (ms) |
| `gemini.api.key` | `[your key]` | Google AI Studio API key |
| `gemini.api.url` | `https://...gemini-2.5-flash:generateContent` | Gemini model endpoint |

---

## 12. Security Architecture

```
Request Arrives
      │
      ▼
JwtAuthenticationFilter
      │
      ├── Has "Authorization: Bearer <token>"? ─── No ──> Pass through (will fail auth later)
      │
      ▼ Yes
Extract JWT String
      │
      ▼
JwtUtil.extractUsername(token) → gets email
      │
      ▼
CustomUserDetailsService.loadUserByUsername(email)
      │
      ▼
JwtUtil.validateToken(token, email)
      │
      ├── Valid? ─── Yes ──> Set SecurityContextHolder.Authentication
      │                          │
      │                          ▼
      │                   Request proceeds to Controller
      │
      └── Invalid/Expired ──> SecurityContextHolder stays null
                                    │
                                    ▼
                               Spring Security returns 403
```

**Token storage:** `localStorage` (client-side). No httpOnly cookie, appropriate for an SPA learning project.

**Password hashing:** BCrypt with default strength (10 rounds). Raw passwords never stored.

**CORS:** Configured to allow `*` origins for development. **For production, restrict to the frontend domain.**

---

## 13. How to Run Locally

### Prerequisites

- Java 17+
- Maven 3.9+ (or use `./mvnw`)
- MySQL 8+ running on port 3306
- Node.js 18+ and npm

### Step 1 — Database Setup

```sql
-- MySQL (auto-created by Hibernate if connection works)
CREATE DATABASE IF NOT EXISTS airesumeanalyzer;
```

Update `application.properties` with your MySQL credentials.

### Step 2 — Backend

```powershell
# From the project root
./mvnw spring-boot:run
# OR: mvn spring-boot:run
```

Backend starts at: **http://localhost:8080**

### Step 3 — Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend starts at: **http://localhost:5173**

### Step 4 — Verify

Visit `http://localhost:5173` → Register → Upload a resume → Paste a job description → Click Analyze.

---

## 14. Environment Variables & Secrets

> ⚠️ **Never commit real secrets to source control.** Use `.env` files or environment-variable substitution in production.

| Secret | Where Used | How to Override |
|---|---|---|
| MySQL password | `application.properties` | Set `SPRING_DATASOURCE_PASSWORD` env var |
| JWT secret key | `application.properties` | Set `JWT_SECRET` env var |
| Gemini API key | `application.properties` | Set `GEMINI_API_KEY` env var |

For production, set `spring.profiles.active=prod` and provide a `application-prod.properties` with injected environment variables:

```properties
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
gemini.api.key=${GEMINI_API_KEY}
```

---

## 15. Known Issues & TODOs

| Issue / TODO | Priority | Notes |
|---|---|---|
| File is saved to `./uploads/` but never deleted on DB record deletion | 🔴 High | `deleteResume` only removes DB row, not the physical file |
| `@JsonIgnore` missing on `User.password` — password hash is returned in some API responses | 🔴 High | Add `@JsonIgnore` to `password` field in `User.java` |
| CORS set to `*` origins | 🟡 Medium | Restrict to frontend domain in production |
| RemoteOK rate-limiting — no caching of job results | 🟡 Medium | Cache results with Redis/Caffeine |
| No resume ownership check in delete endpoints | 🟡 Medium | Anyone with a valid JWT can delete any resume by ID |
| `jwt.expiration` = 24h with no refresh token | 🟢 Low | Add refresh token flow for long sessions |
| No email verification on registration | 🟢 Low | Add Spring Mail + verification link |
| `spring.jpa.show-sql=true` in production | 🟢 Low | Disable or use a logging framework |
| Analysis history linked to `resumeId` but no UI to view analysis detail | 🟢 Low | Add analysis detail modal/page |

---

*Generated from full codebase analysis — February 2026*
