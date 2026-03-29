@echo off
SETLOCAL ENABLEDELAYEDEXPANSION
echo ============================================
echo  OceanVoyage - Windows Setup Helper
echo ============================================
echo.

REM --- 1. Check Prerequisites ---
echo 1. Checking Node.js version...
node -v || (echo Node.js not found! Please install v20.x from nodejs.org & pause & exit /b 1)
echo.

REM --- 2. Backend Setup ---
echo 2. Setting up Backend...
cd cruise-backend
if not exist .env (
    copy .env.example .env
    echo [IMPORTANT] .env file created - Please edit it with your DB password after this script!
)

echo Installing backend dependencies...
call npm install || (echo Backend npm install failed! & pause & exit /b 1)
echo.

REM --- 3. Frontend Setup ---
echo 3. Setting up Frontend...
cd ..\cruise-frontend
if not exist .env.local (
    copy .env.local.example .env.local
    echo .env.local file created.
)

echo Installing frontend dependencies...
call npm install || (echo Frontend npm install failed! & pause & exit /b 1)
echo.

REM --- 4. Database Initialization ---
echo 4. Initializing Database Store...
cd ..\cruise-backend
echo [ACTION] Please ensure DB_PASSWORD is set in cruise-backend\.env before proceeding.
pause
echo Running session table creation...
node create-sessions-table.mjs || echo [WARNING] Session table creation failed. You might need to check your DB settings manually.
echo.

REM --- 5. Final Instructions ---
echo ============================================
echo  Setup successful! 
echo ============================================
echo  NEXT STEPS (Crucial):
echo  1. Ensure PostgreSQL is running and database 'cruise_booking' exists.
echo  2. Run the master seed command (if first time):
echo     cd cruise-backend
echo     npm run seed
echo.
echo  3. Start the project:
echo     Terminal 1 (Backend): cd cruise-backend ^& npm run start:dev
echo     Terminal 2 (Frontend): cd cruise-frontend ^& npm run dev
echo.
echo  4. Open: http://localhost:3000
echo ============================================
pause
