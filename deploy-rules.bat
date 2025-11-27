@echo off
echo 🔧 Firebase Rules Deployment Script
echo.

echo Checking Firebase CLI installation...
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI not found!
    echo Please install Firebase CLI: npm install -g firebase-tools
    echo Then run: firebase login
    goto :eof
)

echo ✅ Firebase CLI found
echo.

echo 🔑 Checking authentication...
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not authenticated with Firebase
    echo Running: firebase login
    firebase login
    if %errorlevel% neq 0 (
        echo ❌ Login failed
        goto :eof
    )
)

echo ✅ Authenticated with Firebase
echo.

echo 🎯 Setting project...
firebase use ecommerce-store---fiverr-gig
if %errorlevel% neq 0 (
    echo ❌ Failed to set project
    echo Please ensure the project ID is correct
    goto :eof
)

echo ✅ Project set successfully
echo.

echo 📋 Available rules files:
echo 1. firestore-dev.rules (Development - Permissive)
echo 2. firestore.rules (Production - Secure)
echo 3. storage.rules (Storage rules)
echo.

set /p choice="Choose rules to deploy (1/2/3 or 'all'): "

if "%choice%"=="1" (
    echo 🚀 Deploying development Firestore rules...
    copy firestore-dev.rules firestore.rules.temp
    firebase deploy --only firestore:rules --project ecommerce-store---fiverr-gig
    del firestore.rules.temp
) else if "%choice%"=="2" (
    echo 🚀 Deploying production Firestore rules...
    firebase deploy --only firestore:rules --project ecommerce-store---fiverr-gig
) else if "%choice%"=="3" (
    echo 🚀 Deploying storage rules...
    firebase deploy --only storage --project ecommerce-store---fiverr-gig
) else if "%choice%"=="all" (
    echo 🚀 Deploying all rules...
    firebase deploy --only firestore:rules,storage --project ecommerce-store---fiverr-gig
) else (
    echo ❌ Invalid choice
    goto :eof
)

if %errorlevel% equ 0 (
    echo.
    echo ✅ Rules deployed successfully!
    echo.
    echo 📖 Next steps:
    echo 1. Test your application functionality
    echo 2. Check Firebase Console for any rule violations
    echo 3. Monitor Firebase logs for security issues
    echo.
    echo 🔗 Firebase Console: https://console.firebase.google.com/project/ecommerce-store---fiverr-gig
) else (
    echo.
    echo ❌ Deployment failed!
    echo Check the error messages above and try again.
)

echo.
echo Press any key to exit...
pause >nul