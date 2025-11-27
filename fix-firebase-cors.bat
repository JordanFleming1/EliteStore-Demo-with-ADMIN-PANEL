@echo off
echo Firebase Storage CORS Configuration Fix
echo =====================================
echo.
echo This script will help you fix the CORS issue with Firebase Storage.
echo.
echo STEP 1: Install Google Cloud SDK (if not already installed)
echo Visit: https://cloud.google.com/sdk/docs/install
echo.
echo STEP 2: Login to Google Cloud
echo Run: gcloud auth login
echo.
echo STEP 3: Set your project
echo Run: gcloud config set project ecommerce-store---fiverr-gig
echo.
echo STEP 4: Apply CORS configuration
echo Run: gsutil cors set cors.json gs://ecommerce-store---fiverr-gig.appspot.com
echo.
echo ALTERNATIVE: Manual Firebase Console Method
echo 1. Go to https://console.firebase.google.com/
echo 2. Select your project: ecommerce-store---fiverr-gig
echo 3. Go to Storage
echo 4. Click on "Rules" tab
echo 5. Replace with the rules from storage.rules file
echo 6. Also check if CORS is enabled in Storage settings
echo.
pause