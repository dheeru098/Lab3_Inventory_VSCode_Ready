@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
    echo Node.js is required. Install the LTS version from https://nodejs.org/
    pause
    exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
    echo npm was not found. Reinstall Node.js LTS.
    pause
    exit /b 1
)
if not exist ".env" copy /y ".env.example" ".env" >nul
if not exist "node_modules\express" (
    echo Installing project dependencies...
    call npm install
    if errorlevel 1 (
        echo The dependency installation failed. Check your internet connection.
        pause
        exit /b 1
    )
)
echo Starting the API. MongoDB must already be running.
call npm start
pause
