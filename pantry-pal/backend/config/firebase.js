// backend/config/firebase.js
import { initializeApp } from 'firebase/app';

// we might (idk yet) if we will need admin firebase module for this

// Import Firebase services as needed, for example:
import { getFirestore } from 'firebase/firestore/lite';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// documentation
// https://www.npmjs.com/package/firebase