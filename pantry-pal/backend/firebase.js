// backend/config/firebase.js
const firebase = require('firebase/app'); // Use Firebase as per your requirement
// Import Firebase services as needed, for example:
// require('firebase/firestore'); // If you are using Firestore

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

module.exports = firebase;
