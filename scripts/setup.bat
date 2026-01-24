@echo off
REM Good Grid Platform Setup Script for Windows

echo 🚀 Setting up Good Grid Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

REM Install dependencies
echo 📦 Installing dependencies...
call npm run install:all

REM Check if .env file exists
if not exist "backend\.env" (
    echo 📝 Creating environment configuration...
    copy "backend\.env.example" "backend\.env"
    echo ⚠️  Please edit backend\.env with your configuration before running the application
)

echo.
echo 🎉 Setup completed!
echo.
echo Next steps:
echo 1. Install PostgreSQL 14+ if not already installed
echo 2. Edit backend\.env with your configuration
echo 3. Set up your Gemini AI API key
echo 4. Create the database: createdb good_grid
echo 5. Run database schema: psql -d good_grid -f backend\src\database\schema.sql
echo 6. Run 'npm run dev' to start development servers
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:3001
echo.
echo For more information, see README.md
pause