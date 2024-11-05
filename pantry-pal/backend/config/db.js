// backend/db.js

import admin from '../config/firebase'; // Import the initialized Firebase Admin SDK
// for some reason this path isn't working :(
const db = admin.firestore(); // Get a Firestore instance



// next step: go to routes/recipes.js
// this will use the functions defined in this file to interact with Firestore