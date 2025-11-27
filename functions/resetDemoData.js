// Firebase Admin SDK initialization
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Default demo data (customize as needed)
const defaultProducts = [
  {
    id: 'demo-product-1',
    name: 'Demo Product 1',
    price: 19.99,
    stock: 10,
    description: 'A sample product for demo purposes.',
    image: '',
    category: 'Demo',
  },
  {
    id: 'demo-product-2',
    name: 'Demo Product 2',
    price: 29.99,
    stock: 5,
    description: 'Another sample product for demo purposes.',
    image: '',
    category: 'Demo',
  },
];

const defaultSettings = {
  siteName: 'EliteStore Demo',
  storeLogo: '',
  navbarTheme: 'gradient',
};

// Helper to reset a collection
async function resetCollection(collection, docs) {
  const ref = db.collection(collection);
  const snap = await ref.get();
  const batch = db.batch();
  snap.forEach(doc => batch.delete(doc.ref));
  docs.forEach(doc => batch.set(ref.doc(doc.id), doc));
  await batch.commit();
}

// Main reset function
exports.resetDemoData = async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS preflight request
    return res.status(204).send('');
  }

  try {
    await resetCollection('products', defaultProducts);
    await db.collection('orders').get().then(snap => {
      const batch = db.batch();
      snap.forEach(doc => batch.delete(doc.ref));
      return batch.commit();
    });
    await db.collection('settings').doc('site').set(defaultSettings, { merge: true });
    res.status(200).send('Demo data reset successfully.');
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).send('Error resetting demo data.');
  }
};
