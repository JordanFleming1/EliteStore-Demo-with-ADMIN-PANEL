// Utility script to clear all Firestore collections for a clean portfolio/demo state
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firebaseConfig } from './firebase.config';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAllFromCollection(collectionName: string) {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  const deletions = snapshot.docs.map((d) => deleteDoc(doc(db, collectionName, d.id)));
  await Promise.all(deletions);
  console.log(`Cleared ${collectionName}`);
}

async function main() {
  await deleteAllFromCollection('orders');
  await deleteAllFromCollection('products');
  await deleteAllFromCollection('users');
  await deleteAllFromCollection('settings');
  await deleteAllFromCollection('categories');
  await deleteAllFromCollection('heroSlides');
  await deleteAllFromCollection('contactMessages');
  console.log('All relevant collections cleared.');
}

main().catch(console.error);
