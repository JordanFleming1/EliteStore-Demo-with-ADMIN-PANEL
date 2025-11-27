@echo off
echo 🔐 Firebase Authentication and Rules Deployment
echo ===============================================
echo.

echo Step 1: Authenticating with Firebase...
echo (This will open a browser window for Google sign-in)
echo.
firebase login

if %errorlevel% neq 0 (
    echo ❌ Authentication failed!
    echo Please try again or use the manual method.
    echo See: DEPLOY-RULES-MANUALLY.md
    pause
    exit /b 1
)

echo ✅ Authentication successful!
echo.

echo Step 2: Setting Firebase project...
firebase use ecommerce-store---fiverr-gig

if %errorlevel% neq 0 (
    echo ❌ Failed to set project!
    echo Please check project ID is correct.
    pause
    exit /b 1
)

echo ✅ Project set successfully!
echo.

echo Step 3: Deploying Firestore rules...
echo (Using firestore.rules which contains your development rules)
firebase deploy --only firestore:rules

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCCESS! Firebase rules deployed!
    echo.
    echo 🎯 Next steps:
    echo 1. Refresh your application (F5)
    echo 2. Navigate to /admin/orders
    echo 3. The permission error should be gone!
    echo.
) else (
    echo.
    echo ❌ Deployment failed!
    echo.
    echo 🔧 Alternative: Use Firebase Console manually
    echo 1. Go to: https://console.firebase.google.com/project/ecommerce-store---fiverr-gig/firestore/rules
    echo 2. Copy the rules from firestore-dev.rules
    echo 3. Paste and click Publish
    echo.
)

echo.
echo Press any key to exit...
pause >nul