🚨 **MANUAL FIREBASE RULES DEPLOYMENT** 

Since Firebase CLI needs authentication, follow these steps to manually deploy your rules:

## **Option 1: Firebase Console (RECOMMENDED - Fastest)**

1. **Open Firebase Console**: 
   https://console.firebase.google.com/project/ecommerce-store---fiverr-gig/firestore/rules

2. **Copy these rules** (from your firestore-dev.rules file):

```javascript
rules_version = '2';

// DEVELOPMENT RULES - More permissive for testing
// ⚠️ DO NOT USE IN PRODUCTION ⚠️
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow authenticated users to read/write everything for development
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow public read for products and categories (for store frontend)
    match /products/{productId} {
      allow read: if true;
    }
    
    match /categories/{categoryId} {
      allow read: if true;
    }
    
    match /reviews/{reviewId} {
      allow read: if true;
    }
  }
}
```

3. **Replace all existing rules** in the Firebase Console with the above
4. **Click "Publish"**
5. **Wait for "Rules published successfully"**

## **Option 2: Firebase CLI (if you want to authenticate)**

```bash
# Authenticate (this will open browser)
firebase login

# Set project
firebase use ecommerce-store---fiverr-gig

# Deploy rules (I already copied firestore-dev.rules to firestore.rules)
firebase deploy --only firestore:rules
```

## **After deployment:**
- Refresh your application (F5)
- Navigate to `/admin/orders`
- The permission error should be gone!
- You should see "✅ Orders fetched successfully" in console

---

**👆 Use Option 1 (Firebase Console) for the quickest fix!**