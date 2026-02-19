# AI Resume Analyzer - Complete Setup Guide

This guide provides step-by-step instructions to set up the **AI Resume Analyzer** project from scratch, including database installation, backend configuration, and frontend integration.

---

## 🛠️ Prerequisites

Before starting, ensure you have the following installed on your system:
1.  **Java Development Kit (JDK) 17 or higher** (JDK 25 is supported with our setup).
2.  **Node.js** (v18 or higher) & **npm**.
3.  **MySQL Server** (v8.0 or higher).
4.  **Google Gemini API Key**.

---

## 1️⃣ Database Setup (MySQL)

You need a running MySQL instance for the backend to store users and resume data.

### Option A: Clean Installation (If you don't have MySQL)
1.  **Download**: Go to [MySQL Community Server](https://dev.mysql.com/downloads/installer/) and download the **MySQL Installer for Windows**.
2.  **Install**:
    -   Run the installer.
    -   Select **"Server only"** or **"Developer Default"**.
    -   During configuration, note down the **Root Password** you set. **Important!**
    -   Ensure the server starts on port **3306** (default).
3.  **Verify**: Open "MySQL Command Line Client" or "MySQL Workbench" and login with your root password to confirm access.

### Option B: Using Existing MySQL
If you already have MySQL, just ensure you know your **username** (usually `root`) and **password**.

---

## 2️⃣ Backend Configuration (Spring Boot)

The backend connects to MySQL and the Gemini API. We need to configure it with your credentials.

1.  **Open Configuration File**:
    Navigate to:
    `c:\Users\Akshay Pratap Singh\Downloads\airesumeanalyzer\airesumeanalyzer\src\main\resources\application.properties`

2.  **Update Database Credentials**:
    Replace `spring.datasource.username` and `spring.datasource.password` with your MySQL credentials.
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/airesumeanalyzer?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
    spring.datasource.username=root
    spring.datasource.password=YOUR_MYSQL_PASSWORD  <-- UPDATE THIS
    ```

3.  **Add Gemini API Key**:
    Replace the placeholder with your actual API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    ```properties
    gemini.api.key=YOUR_ACTUAL_API_KEY_HERE      <-- UPDATE THIS
    ```
    *Note: Do not commit strictly confidential keys to public repositories.*

---

## 3️⃣ Running the Backend

We have created a script to handle the startup process, including SSL handling and Java path configuration.

1.  **Open Terminal** in the project root: `c:\Users\Akshay Pratap Singh\Downloads\airesumeanalyzer\airesumeanalyzer`
2.  **Run the Script**:
    ```powershell
    .\run_backend.bat
    ```
3.  **Wait for Startup**:
    You should see logs indicating Spring Boot is starting. Look for:
    `Started AiresumeanalyzerApplication in X.XXX seconds`
    The server will run on **http://localhost:8080**.

---

## 4️⃣ Frontend Setup & Integration (React)

The frontend is a React SPA that connects to the backend at `http://localhost:8080`.

1.  **Navigate to Frontend Directory**:
    ```powershell
    cd frontend
    ```
2.  **Install Dependencies**:
    ```powershell
    npm install
    ```
3.  **Run Development Server**:
    ```powershell
    npm run dev
    ```
4.  **Access the App**:
    Open your browser and go to **http://localhost:5173**.

---

## 🔍 Frontend-Backend Connection Analysis

We have analyzed the connection between the frontend and backend:

*   **Frontend API Config (`src/services/api.ts`)**:
    *   The base URL is configured as: `const API_URL = 'http://localhost:8080';`
    *   This matches the default port of the Spring Boot backend.
    *   **Result**: ✅ Correctly pointing to local backend.

*   **Tailwind CSS Integration**:
    *   We see you installed `@tailwindcss/vite`.
    *   `vite.config.ts` includes the `tailwindcss()` plugin.
    *   `src/index.css` imports `tailwindcss`.
    *   **Result**: ✅ Tailwind is correctly configured.

---

## ❓ Troubleshooting

*   **"Communications link failure"**:
    *   **Cause**: The backend cannot connect to MySQL.
    *   **Fix**: Ensure MySQL Service is running (check Services.msc -> MySQL80) and your username/password in `application.properties` are correct.

*   **"Address already in use"**:
    *   **Cause**: Port 8080 (Backend) or 5173 (Frontend) is occupied.
    *   **Fix**: Stop other running servers or change the port in `application.properties` (`server.port=8081`).

*   **"Gemini API Error"**:
    *   **Cause**: Invalid API key or quota exceeded.
    *   **Fix**: Double check your key in `application.properties`.
