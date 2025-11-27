@echo off
echo Setting up Firebase Storage CORS configuration...
echo.

REM Check if gcloud is installed
gcloud --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Google Cloud CLI not found!
    echo Please install it from: https://cloud.google.com/sdk/docs/install
    echo.
    echo Alternative: Use Firebase Console Storage Rules instead
    goto :eof
)

echo ✅ Google Cloud CLI found
echo.

REM Apply CORS configuration to Firebase Storage bucket
echo Applying CORS configuration to Firebase Storage...
echo Bucket: gs://ecommerce-store---fiverr-gig.appspot.com
echo.

gsutil cors set cors.json gs://ecommerce-store---fiverr-gig.appspot.com

if %errorlevel% equ 0 (
    echo.
    echo ✅ CORS configuration applied successfully!
    echo.
    echo You can now test image uploads in your application.
) else (
    echo.
    echo ❌ Failed to apply CORS configuration
    echo.
    echo Please make sure you're authenticated with gcloud:
    echo   gcloud auth login
    echo   gcloud config set project ecommerce-store---fiverr-gig
)

echo.
echo Press any key to continue...
pause >nul