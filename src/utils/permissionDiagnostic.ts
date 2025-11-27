import { auth, db, storage } from '../firebase/firebase.config';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export class PermissionDiagnostic {
  
  static async runDiagnostics(): Promise<void> {
    console.log('🔍 Running Firebase Permissions Diagnostics...');
    console.log('='.repeat(50));
    
    // 1. Check Authentication
    await this.checkAuth();
    
    // 2. Check Firestore Permissions
    await this.checkFirestorePermissions();
    
    // 3. Check Storage Permissions
    await this.checkStoragePermissions();
    
    console.log('='.repeat(50));
    console.log('✅ Diagnostics Complete');
  }
  
  static async checkAuth(): Promise<void> {
    console.log('\n1️⃣ Authentication Check');
    console.log('-'.repeat(30));
    
    const user = auth.currentUser;
    if (user) {
      console.log('✅ User authenticated');
      console.log(`📧 Email: ${user.email}`);
      console.log(`🆔 UID: ${user.uid}`);
      console.log(`✉️ Email verified: ${user.emailVerified}`);
      
      try {
        const token = await user.getIdToken();
        console.log('✅ Auth token obtained successfully');
        console.log(`🔑 Token preview: ${token.substring(0, 50)}...`);
      } catch (error) {
        console.error('❌ Failed to get auth token:', error);
      }
    } else {
      console.log('❌ No user authenticated');
      console.log('💡 Please sign in to test permissions');
    }
  }
  
  static async checkFirestorePermissions(): Promise<void> {
    console.log('\n2️⃣ Firestore Permissions Check');
    console.log('-'.repeat(30));
    
    const user = auth.currentUser;
    if (!user) {
      console.log('⚠️ Skipping Firestore tests - no authenticated user');
      return;
    }
    
    // Test Products Collection (should be readable)
    try {
      console.log('📦 Testing products collection read...');
      const productsRef = collection(db, 'products');
      await addDoc(productsRef, {
        name: 'Test Product',
        price: 9.99,
        description: 'Test product for permissions',
        category: 'test',
        stock: 1,
        createdAt: new Date()
      });
      console.log('✅ Products collection accessible');
    } catch (error) {
      console.error('❌ Products collection error:', error);
    }
    
    // Test Orders Collection
    try {
      console.log('🛒 Testing orders collection...');
      
      // Try to create a test order
      const testOrder = {
        orderNumber: `TEST-${Date.now()}`,
        userId: user.uid,
        customer: {
          id: user.uid,
          email: user.email,
          displayName: user.displayName || 'Test User'
        },
        items: [],
        subtotal: 0,
        totalAmount: 0,
        status: 'pending',
        paymentStatus: 'pending',
        statusHistory: [],
        shippingAddress: {
          id: 'test',
          type: 'shipping',
          firstName: 'Test',
          lastName: 'User',
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country',
          phone: '555-0123',
          isDefault: true
        },
        billingAddress: {
          id: 'test',
          type: 'billing',
          firstName: 'Test',
          lastName: 'User',
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country',
          phone: '555-0123',
          isDefault: true
        },
        paymentMethod: 'test',
        priority: 'normal',
        source: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const ordersRef = collection(db, 'orders');
      await addDoc(ordersRef, testOrder);
      console.log('✅ Orders collection - write permission OK');
      
    } catch (error) {
      console.error('❌ Orders collection error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          console.log('💡 This appears to be a permissions issue');
          console.log('🔧 Try deploying the development rules:');
          console.log('   Run: deploy-rules.bat and choose option 1');
        }
        if (error.message.includes('CORS')) {
          console.log('💡 This appears to be a CORS issue');
          console.log('🔧 Check your Firebase configuration and rules');
        }
      }
    }
    
    // Test User Document
    try {
      console.log('👤 Testing user document access...');
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.log('✅ User document read permission OK');
      } else {
        console.log('ℹ️ User document does not exist (this is normal)');
        
        // Try to create user document
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName || 'Test User',
          role: 'admin', // Set as admin for testing
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('✅ User document write permission OK');
      }
    } catch (error) {
      console.error('❌ User document error:', error);
    }
  }
  
  static async checkStoragePermissions(): Promise<void> {
    console.log('\n3️⃣ Storage Permissions Check');
    console.log('-'.repeat(30));
    
    const user = auth.currentUser;
    if (!user) {
      console.log('⚠️ Skipping Storage tests - no authenticated user');
      return;
    }
    
    try {
      console.log('📁 Testing storage upload permissions...');
      
      // Create a test file
      const testContent = 'This is a test file for permissions check';
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testFile = new File([testBlob], 'permission-test.txt');
      
      // Try to upload to products folder
      const storageRef = ref(storage, `products/test-${Date.now()}.txt`);
      const uploadResult = await uploadBytes(storageRef, testFile);
      console.log('✅ Storage upload permission OK');
      
      // Try to get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('✅ Storage download permission OK');
      console.log(`🔗 Test file URL: ${downloadURL}`);
      
    } catch (error) {
      console.error('❌ Storage permission error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          console.log('💡 Storage permissions issue detected');
          console.log('🔧 Solutions:');
          console.log('   1. Deploy storage rules: deploy-rules.bat option 3');
          console.log('   2. Check Firebase Console → Storage → Rules');
          console.log('   3. Ensure user is authenticated');
        }
        if (error.message.includes('CORS')) {
          console.log('💡 CORS issue detected');
          console.log('🔧 Run: setup-cors.bat to fix CORS configuration');
        }
      }
    }
  }
  
  static async checkAdminPermissions(): Promise<void> {
    console.log('\n4️⃣ Admin Permissions Check');
    console.log('-'.repeat(30));
    
    const user = auth.currentUser;
    if (!user) {
      console.log('⚠️ Skipping admin tests - no authenticated user');
      return;
    }
    
    // Check if user has admin role
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin') {
          console.log('✅ User has admin role');
        } else {
          console.log('⚠️ User does not have admin role');
          console.log('💡 Admin permissions may be limited');
        }
      }
    } catch (error) {
      console.error('❌ Error checking admin role:', error);
    }
  }
  
  static logSystemInfo(): void {
    console.log('\n📋 System Information');
    console.log('-'.repeat(30));
    console.log(`🌍 User Agent: ${navigator.userAgent}`);
    console.log(`🔗 Origin: ${window.location.origin}`);
    console.log(`🎯 Firebase Project: ${auth.app.options.projectId}`);
    console.log(`💾 Storage Bucket: ${auth.app.options.storageBucket}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  }
}

// Export a simple function to run diagnostics
export const runPermissionDiagnostics = async (): Promise<void> => {
  PermissionDiagnostic.logSystemInfo();
  await PermissionDiagnostic.runDiagnostics();
  await PermissionDiagnostic.checkAdminPermissions();
};