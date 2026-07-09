import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error('Please configure Firebase in .env.local first!');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const authInstance = getAuth(app);

async function seedAdmin() {
  console.log('--- Starting Admin User Seeding ---');
  const adminEmail = 'admin@gmail.com';
  const adminPassword = '1234576';

  try {
    // 1. Try to create the admin account in Firebase Authentication
    console.log(`Creating Auth account for: ${adminEmail}...`);
    const userCredential = await createUserWithEmailAndPassword(authInstance, adminEmail, adminPassword);
    const uid = userCredential.user.uid;
    console.log(`Auth account created successfully! UID: ${uid}`);

    // 2. Create the user profile doc in Firestore users collection
    console.log('Writing admin profile to Firestore "users" collection...');
    await setDoc(doc(db, 'users', uid), {
      id: uid,
      email: adminEmail,
      name: 'System Admin',
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    console.log('Firestore admin document written successfully!');
    
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Auth account already exists. Attempting to log in to fetch UID and update Firestore role...');
      try {
        const userCredential = await signInWithEmailAndPassword(authInstance, adminEmail, adminPassword);
        const uid = userCredential.user.uid;
        console.log(`Logged in successfully! UID: ${uid}. Updating Firestore role to "admin"...`);
        
        await setDoc(doc(db, 'users', uid), {
          id: uid,
          email: adminEmail,
          name: 'System Admin',
          role: 'admin',
          createdAt: new Date().toISOString(),
        }, { merge: true });
        
        console.log('Firestore admin document updated successfully!');
      } catch (loginError: any) {
        console.error('Failed to log in to existing account (check if password is correct):', loginError.message);
      }
    } else {
      console.error('Error seeding admin user:', error.message || error);
    }
  }

  console.log('--- Admin Seeding Completed ---');
  process.exit(0);
}

seedAdmin();
