# AI Resume Analyzer

AI-powered web platform that enables job seekers to upload resumes and analyze them against job descriptions using Google Gemini.

## Prerequisites

- Java 17+
- Node.js 18+
- MySQL Database
- Google Gemini API Key

## Backend Setup (Spring Boot)

1.  **Configure Application Properties**:
    Update `src/main/resources/application.properties` with your database credentials and API key:
    ```properties
    spring.datasource.username=YOUR_DB_USER
    spring.datasource.password=YOUR_DB_PASSWORD
    gemini.api.key=YOUR_GEMINI_API_KEY
    ```

2.  **Run the Application**:
    ```bash
    ./mvnw spring-boot:run
    ```
    The backend will start at `http://localhost:8080`.

    *Note: If you face SSL errors with wrapper download, run this in PowerShell first:*
    ```powershell
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
    ```

## Frontend Setup (React + Vite)

1.  **Navigate to frontend directory**:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The frontend will start at `http://localhost:5173`.

## Features

- **Authentication**: Secure Login/Register with JWT.
- **Resume Upload**: Upload PDF/DOCX resumes (parsed via Apache Tika).
- **AI Analysis**: Get Match Score, Missing Skills, and Improvement Suggestions.
- **History**: View past uploaded resumes.
- **Modern UI**: Dark mode with Glassmorphism design.
