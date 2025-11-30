# Firebase Storage CORS Fix Guide

## Problem
Firebase Storage is blocking image uploads due to CORS policy. This prevents the admin from uploading product images.

## Error Message
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/v0/b/ecommerce-store---fiverr-gig.firebasestorage.app/o?name=products%2F...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

## Solution 1: Firebase Console (EASIEST)
1. Go to https://console.firebase.google.com/
2. Select project: "ecommerce-store---fiverr-gig"
3. Navigate to Storage
4. Click "Rules" tab
5. Replace the current rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write, delete: if request.auth != null;
    }
  }
}
```

6. Click "Publish"

## Solution 2: Google Cloud SDK
1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Run these commands:
```bash
gcloud auth login
gcloud config set project ecommerce-store---fiverr-gig
gsutil cors set cors.json gs://ecommerce-store---fiverr-gig.firebasestorage.app
```

## Solution 3: Temporary Development Fix
For immediate testing, you can:
1. Build and deploy the app to Firebase Hosting
2. Use Firebase Local Emulator Suite
3. Or temporarily disable CORS checking in Chrome (NOT recommended for production)

## Verification
After applying the fix:
1. Go to your admin panel
2. Try uploading an image
3. Check browser console for success messages
4. The image should upload and display in your product form

## Files Created
- `storage.rules` - Firebase Storage security rules
- `cors.json` - CORS configuration for Google Cloud Storage
- `fix-firebase-cors.bat` - Batch script with commands

## Next Steps
Once CORS is fixed, the image upload should work immediately without any code changes.