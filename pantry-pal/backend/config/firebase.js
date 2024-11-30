import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync(new URL('./pantry-pal-7ccff-firebase-adminsdk-wf4ap-e4d9fcdb25.json', import.meta.url)));

const firebaseAdminConfig = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
};


const app = admin.initializeApp(firebaseAdminConfig);
export const db = admin.firestore();
export const auth = admin.auth();

// documentation
// https://www.npmjs.com/package/firebase