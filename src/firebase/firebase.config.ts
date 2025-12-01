// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
if (typeof window !== "undefined") {
  // Only initialize analytics in the browser
  analytics = getAnalytics(app);
}
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Storage with explicit bucket reference
const storage = getStorage(app, "gs://ecommerce-store---fiverr-gig.appspot.com");

// Log configuration for debugging (browser only)
if (typeof window !== "undefined") {
  console.log('🔥 Firebase Config Loaded:');
  console.log('Project ID:', firebaseConfig.projectId);
  console.log('Storage Bucket:', firebaseConfig.storageBucket);
  console.log('Storage Instance Bucket:', storage.app.options.storageBucket);
}

export { app, analytics, auth, db, storage };