@echo off
echo ============================================
echo Portfolio Strategy Dashboard Setup
echo ============================================
echo.

echo Checking for Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Node.js found!
echo.

echo Installing dependencies...
echo This may take 1-2 minutes...
echo.

npm install

if errorlevel 1 (
    echo.
    echo ERROR: Installation failed!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo ============================================
echo Installation complete!
echo ============================================
echo.
echo To start the dashboard, run: npm run dev
echo Or double-click the "START_DASHBOARD.bat" file
echo.
pause
