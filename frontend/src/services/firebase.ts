// SpeedxSafety - Firebase Configuration
// Replace these values with your Firebase project credentials
// Get them from: https://console.firebase.google.com → Project Settings

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "speedxsafety.firebaseapp.com",
  databaseURL: "https://speedxsafety-default-rtdb.firebaseio.com",
  projectId: "speedxsafety",
  storageBucket: "speedxsafety.appspot.com",
  messagingSenderId: "000000000000",
  appId: "YOUR_APP_ID",
};

// ================================================
// Firebase is not initialized yet — this is a placeholder.
// To activate Firebase:
// 1. Create project at console.firebase.google.com
// 2. Enable Authentication (Email/Password)
// 3. Create Firestore database
// 4. Create Realtime Database
// 5. Replace config values above
// 6. Uncomment the initialization below
// ================================================

/*
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
*/
