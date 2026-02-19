# Database Schema, Setup, and API Usage Guide

## 1. Database Status
**Status:** ✅ **Working and Created Successfully**

Your Spring Boot backend has successfully started and connected to the MySQL database. Hibernate has automatically executed the necessary SQL to create your tables.

**Log Evidence:**
```text
Hibernate: create table users ...
Hibernate: create table resumes ...
Hibernate: create table analyses ...
Tomcat started on port 8080 ...
Started AiresumeanalyzerApplication ...
```

## 2. Database Connection Details
*   **Database Name:** `airesumeanalyzer`
*   **Username:** `root`
*   **Password:** `Cbum@2616`
*   **Port:** `3306`
*   **URL:** `jdbc:mysql://localhost:3306/airesumeanalyzer`

---

## 3. detailed SQL Schema
This SQL script reproduces the schema currently running in your application. It supports **Signup, Signin, Authentication, Resume Upload, files reference, and Analysis results**.

```sql
-- Create Database
CREATE DATABASE IF NOT EXISTS airesumeanalyzer;
USE airesumeanalyzer;

-- 1. Users Table (Signup, Signin, Auth)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT UK_users_email UNIQUE (email)
) ENGINE=InnoDB;

-- 2. Resumes Table (Resume Upload)
CREATE TABLE IF NOT EXISTS resumes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    file_name VARCHAR(255) NOT NULL,
    extracted_text LONGTEXT, -- Content extracted from PDF/DOCX
    user_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_resumes_user 
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Analyses Table (Resume Analysis)
CREATE TABLE IF NOT EXISTS analyses (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6),
    job_description LONGTEXT, -- The job description payload
    result LONGTEXT, -- JSON result from Gemini AI
    score DOUBLE,
    resume_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_analyses_resume 
        FOREIGN KEY (resume_id) REFERENCES resumes (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

## 4. API Usage Steps (How to use Signup, Signin, Upload, Analyze)

Since the backend is working, here are the exact steps to verify the functionality using a tool like **Postman** or **cURL**.

### Step 1: Signup (Register a new user)
This creates a new row in the `users` table.

*   **Endpoint:** `POST http://localhost:8080/auth/register`
*   **Headers:** `Content-Type: application/json`
*   **Body:**
    ```json
    {
      "name": "Test User",
      "email": "test@example.com",
      "password": "password123"
    }
    ```
*   **Success Response:** `200 OK` - "User registered successfully"

### Step 2: Signin (Login & Get Token)
This verifies credentials against the `users` table and returns a JWT.

*   **Endpoint:** `POST http://localhost:8080/auth/login`
*   **Headers:** `Content-Type: application/json`
*   **Body:**
    ```json
    {
      "email": "test@example.com",
      "password": "password123"
    }
    ```
*   **Success Response:** `200 OK`
    ```json
    {
      "token": "YOUR_JWT_TOKEN_HERE"
    }
    ```
    ⚠️ **Copy this token.** You will need it for the next steps.

### Step 3: Resume Upload
This uploads a file, extracts text, and saves it to the `resumes` table linked to your user.

*   **Endpoint:** `POST http://localhost:8080/api/resume/upload`
*   **Headers:**
    *   `Authorization: Bearer YOUR_JWT_TOKEN_HERE`
*   **Body (form-data):**
    *   Key: `file` (Type: File) -> Select a PDF or DOCX file.
*   **Success Response:** `200 OK`
    ```json
    {
      "id": 1,
      "fileName": "my_resume.pdf",
      "extractedText": "...text content..."
    }
    ```
    ⚠️ **Note the `id` (e.g., 1).** You need it for analysis.

### Step 4: Analyze Resume
This sends the resume text and a job description to Gemini, then saves the result in the `analyses` table.

*   **Endpoint:** `POST http://localhost:8080/api/analyze/{resumeId}` (e.g., `/api/analyze/1`)
*   **Headers:**
    *   `Content-Type: application/json`
    *   `Authorization: Bearer YOUR_JWT_TOKEN_HERE`
*   **Body:**
    ```json
    {
      "jobDescription": "Looking for a Java Developer with Spring Boot experience..."
    }
    ```
*   **Success Response:** `200 OK` - Returns the analysis object with score and feedback.
