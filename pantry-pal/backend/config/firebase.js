// backend/config/firebase.js
import { initializeApp } from 'firebase/app';
<<<<<<< Updated upstream
// we might (idk yet) if we will need admin firebase module for this

// Import Firebase services as needed, for example:
import { getFirestore } from 'firebase/firestore/lite';

// need to replace this with the .env variables
=======
import { getDatabase } from "firebase/database";

>>>>>>> Stashed changes
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// documentation
// https://www.npmjs.com/package/firebase