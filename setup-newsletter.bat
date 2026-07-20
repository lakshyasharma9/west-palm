@echo off
echo ========================================
echo Newsletter Feature Setup
echo ========================================
echo.

echo Step 1: Creating DynamoDB Table...
cd Backend
node scripts\create-newsletters-table.js
if %errorlevel% neq 0 (
    echo Error creating table!
    pause
    exit /b 1
)
echo.

echo Step 2: Checking environment variables...
findstr /C:"DYNAMODB_NEWSLETTERS_TABLE" .env >nul
if %errorlevel% neq 0 (
    echo Adding DYNAMODB_NEWSLETTERS_TABLE to .env...
    echo DYNAMODB_NEWSLETTERS_TABLE=wpcs-newsletters >> .env
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: cd Backend ^&^& npm start
echo 2. Start frontend: cd Frontend ^&^& npm run dev
echo 3. Start admin: cd wpcs-admin-panel ^&^& npm run dev
echo.
echo Then visit:
echo - Public: http://localhost:3000/newsletter
echo - Admin: http://localhost:8080/admin/newsletters
echo.
pause
