@echo off
REM HR Agent Bot - Salesforce Deployment Script (Windows Batch)

echo ========================================
echo HR Agent Bot - Salesforce Deployment
echo ========================================
echo.

REM Check if Salesforce CLI is installed
where sfdx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Salesforce CLI not found!
    echo.
    echo Please install Salesforce CLI:
    echo   npm install -g @salesforce/cli
    echo.
    echo Or download from: https://developer.salesforce.com/tools/sfdxcli
    pause
    exit /b 1
)

echo [OK] Salesforce CLI detected
echo.

REM Navigate to LWC directory
cd /d "%~dp0salesforce-lwc"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] salesforce-lwc directory not found
    pause
    exit /b 1
)

echo Working directory: %CD%
echo.

echo Choose deployment method:
echo   1. Deploy to authenticated org
echo   2. Authenticate with new org first
echo   3. Show manual instructions
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto deploy
if "%choice%"=="2" goto auth
if "%choice%"=="3" goto instructions
goto invalid

:deploy
echo.
echo Deploying to Salesforce...
sfdx force:source:deploy -p . --json
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Deployment completed!
    echo.
    echo Next steps:
    echo   1. Configure Remote Site Settings
    echo      Setup - Security - Remote Site Settings
    echo      Add: https://deploy-hr-agent-bot-1.onrender.com
    echo.
    echo   2. Add to Lightning page
    echo      Setup - Lightning App Builder
    echo      Find HR Agent Bot component
) else (
    echo.
    echo [ERROR] Deployment failed!
)
goto end

:auth
echo.
echo Authenticating with Salesforce...
echo A browser window will open.
echo.
set /p orgAlias="Enter org alias (e.g., WinfomiOrg): "
sfdx auth:web:login -a %orgAlias%
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Authentication completed!
    echo.
    echo Now deploying...
    sfdx force:source:deploy -p . -u %orgAlias% --json
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [SUCCESS] Deployment completed!
    )
)
goto end

:instructions
echo.
echo ========================================
echo Manual Deployment Instructions
echo ========================================
echo.
echo Option A: Using Salesforce CLI
echo   1. sfdx auth:web:login -a WinfomiOrg
echo   2. sfdx force:source:deploy -p . -u WinfomiOrg
echo.
echo Option B: Using VS Code
echo   1. Install Salesforce Extension Pack
echo   2. Right-click salesforce-lwc folder
echo   3. Select SFDX: Deploy Source to Org
echo.
echo Option C: Manual Upload
echo   1. Open Developer Console
echo   2. File - New - Lightning Component
echo   3. Copy each file manually
goto end

:invalid
echo.
echo [ERROR] Invalid choice
goto end

:end
echo.
echo Documentation:
echo   - QUICK_START.md
echo   - HOMEPAGE_INTEGRATION_GUIDE.md
echo   - SALESFORCE_INTEGRATION.md
echo.
echo Bot URL: https://deploy-hr-agent-bot-1.onrender.com
echo.
pause
