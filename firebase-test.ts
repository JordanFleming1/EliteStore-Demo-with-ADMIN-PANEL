// Firebase Configuration Validation Test

console.log('🔥 Firebase Configuration Check');
console.log('===============================');

import { storage } from './src/firebase/firebase.config';

console.log('✅ Firebase Storage Instance:', storage);
console.log('📦 App Name:', storage.app.name);
console.log('🗂️ Storage Bucket:', storage.app.options.storageBucket);

// Test bucket URL format
const bucketUrl = storage.app.options.storageBucket;
if (bucketUrl?.endsWith('.appspot.com')) {
    console.log('✅ Correct bucket format: ends with .appspot.com');
} else if (bucketUrl?.endsWith('.app')) {
    console.log('❌ Incorrect bucket format: ends with .app (should be .appspot.com)');
} else {
    console.log('⚠️ Unknown bucket format:', bucketUrl);
}

console.log('🌐 Expected Storage URLs will start with:');
console.log('   https://firebasestorage.googleapis.com/v0/b/' + bucketUrl);

export {};