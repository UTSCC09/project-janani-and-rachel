// backend/config/firebase.js
//import { initializeApp } from 'firebase/app';
import admin from 'firebase-admin';
//import { getFirestore } from 'firebase-admin/firestore';
//import { getAuth } from 'firebase/auth';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync(new URL('./pantry-pal-7ccff-firebase-adminsdk-wf4ap-e4d9fcdb25.json', import.meta.url)));


// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//   databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID,
//   measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
// };

const firebaseAdminConfig = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
};


const app = admin.initializeApp(firebaseAdminConfig);
export const db = admin.firestore();
export const auth = admin.auth();

// documentation
// https://www.npmjs.com/package/firebase