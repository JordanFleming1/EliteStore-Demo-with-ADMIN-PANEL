// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBA-ZYA1kmi3zbrlndeAfwb9LQR9cK7Tsw",
  authDomain: "ecommerce-store---fiverr-gig.firebaseapp.com",
  projectId: "ecommerce-store---fiverr-gig",
  storageBucket: "ecommerce-store---fiverr-gig.appspot.com",
  messagingSenderId: "150422941082",
  appId: "1:150422941082:web:3e7bb107b836f1edf0de23",
  measurementId: "G-RDW28Y9TNJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Storage with explicit bucket reference
const storage = getStorage(app, "gs://ecommerce-store---fiverr-gig.appspot.com");

// Log configuration for debugging
console.log('🔥 Firebase Config Loaded:');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Storage Bucket:', firebaseConfig.storageBucket);
console.log('Storage Instance Bucket:', storage.app.options.storageBucket);

export { app, analytics, auth, db, storage };