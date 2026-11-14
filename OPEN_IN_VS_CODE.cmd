@echo off
cd /d "%~dp0"
where code >nul 2>nul
if not errorlevel 1 (
    start "" code "Lab3_Inventory.code-workspace"
    exit /b 0
)
if exist "%LocalAppData%\Programs\Microsoft VS Code\Code.exe" (
    start "" "%LocalAppData%\Programs\Microsoft VS Code\Code.exe" "Lab3_Inventory.code-workspace"
    exit /b 0
)
if exist "%ProgramFiles%\Microsoft VS Code\Code.exe" (
    start "" "%ProgramFiles%\Microsoft VS Code\Code.exe" "Lab3_Inventory.code-workspace"
    exit /b 0
)
echo Visual Studio Code was not found automatically.
echo Open VS Code and choose File, Open Workspace from File.
echo Select Lab3_Inventory.code-workspace in this folder.
pause
