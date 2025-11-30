# Firebase Storage Upload Fix Guide

## Current Status ✅
- ✅ **Correct storage URL**: Using `.appspot.com` 
- ✅ **Using Firebase SDK**: `uploadBytesResumable` method
- ❌ **CORS configuration**: Needs to be applied

## Quick Fix Steps

### Option 1: Apply CORS Configuration (Recommended)
1. **Install Google Cloud CLI** (if not installed):
   - Download from: https://cloud.google.com/sdk/docs/install
   - Run installer and restart terminal

2. **Authenticate with Google Cloud**:
   ```cmd
   gcloud auth login
   gcloud config set project ecommerce-store---fiverr-gig
   ```

3. **Run the CORS setup script**:
   ```cmd
   setup-cors.bat
   ```

### Option 2: Firebase Storage Rules (Alternative)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `ecommerce-store---fiverr-gig`
3. Go to **Storage → Rules**
4. Replace with these rules:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true;
       }
     }
   }
   ```
5. Click **Publish**

## Verification Steps
After applying either fix:

1. **Clear browser cache** (Ctrl + Shift + Delete)
2. **Restart your development server**:
   ```cmd
   npm run dev
   ```
3. **Test image upload** in admin panel
4. **Check browser console** for any remaining errors

## Debug Information
Your current Firebase config:
- Project ID: `ecommerce-store---fiverr-gig`
- Storage Bucket: `ecommerce-store---fiverr-gig.appspot.com`
- Using: `uploadBytesResumable` (correct method)
- Auth: Firebase Auth with token refresh

## If Still Not Working
1. Check Firebase Storage quota/billing
2. Verify Firebase project is active
3. Test with a small image file (< 1MB)
4. Check if antivirus/firewall is blocking requests