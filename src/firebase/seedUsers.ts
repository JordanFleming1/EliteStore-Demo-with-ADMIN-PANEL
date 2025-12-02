import { auth, db } from './firebase.config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const customers = [
  { email: 'customer1@example.com', password: 'password123', displayName: 'Alice Smith' },
  { email: 'customer2@example.com', password: 'password123', displayName: 'Bob Johnson' },
  { email: 'customer3@example.com', password: 'password123', displayName: 'Charlie Brown' },
  { email: 'customer4@example.com', password: 'password123', displayName: 'Dana Lee' },
  { email: 'customer5@example.com', password: 'password123', displayName: 'Eve Davis' },
];

const admin = { email: 'admin@elitestore.com', password: 'EliteStore!2025$SuperSecret', displayName: 'EliteStore Admin' };

async function seedUsers() {
  // Create admin user
  try {
    const adminCred = await createUserWithEmailAndPassword(auth, admin.email, admin.password);
    await setDoc(doc(db, 'users', adminCred.user.uid), {
      displayName: admin.displayName,
      email: admin.email,
      totalOrders: 0,
      totalSpent: 0,
      joinedAt: new Date().toISOString(),
      role: 'admin',
    });
    console.log('Admin user created:', admin.email);
  } catch (err) {
    console.error('Admin user error:', err);
  }
  // Create non-admin users in Firebase Auth and Firestore 'users' table
  for (const customer of customers) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, customer.email, customer.password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        displayName: customer.displayName,
        email: customer.email,
        totalOrders: 0,
        totalSpent: 0,
        joinedAt: new Date().toISOString(),
        role: 'customer',
      });
      console.log('Customer user created:', customer.email);
    } catch (err) {
      console.error('Customer user error:', customer.email, err);
    }
  }
}

// Run the seeder
seedUsers().then(() => {
  console.log('Seeding complete');
  // Optionally, process.exit(0);
});