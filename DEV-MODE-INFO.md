# Development Mode Configuration

## Current Status: MOCK UPLOAD MODE ACTIVE

Due to Firebase Storage CORS issues, the admin panel is currently using mock image uploads in development mode.

## Mock Mode Features:
- ✅ Simulates successful image uploads
- ✅ Uses placeholder images from placeholder.com
- ✅ Shows warning notification about development mode
- ✅ Allows testing all other functionality (product creation, editing, etc.)
- ✅ Upload progress and validation still work normally

## To Switch to Real Firebase Uploads:

### Method 1: Fix CORS (Recommended)
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: "ecommerce-store---fiverr-gig"
3. Go to Storage > Rules
4. Replace rules with content from `storage.rules` file
5. Click "Publish"
6. Mock mode will automatically disable

### Method 2: Force Real Uploads (Advanced)
In `AdminProducts.tsx`, change line 55:
```javascript
const mockUploadMode = false; // Force real uploads
```

## Testing in Mock Mode:
- Upload any image file
- You'll see placeholder images instead of real uploads
- Product creation/editing works normally
- Warning notification appears about development mode

## When CORS is Fixed:
- Mock mode automatically detects production environment
- Real Firebase Storage uploads will be used
- No code changes needed