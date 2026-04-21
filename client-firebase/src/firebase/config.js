import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Values come from your Firebase console — Project Settings → Your apps → Web app.
// Drop them into .env.local as VITE_FIREBASE_* (see .env.example).
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID
};

if (!firebaseConfig.projectId) {
  console.error('[firebase] VITE_FIREBASE_PROJECT_ID is missing — check client-firebase/.env.local');
}

export const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);
