// backend/db.js
const admin = require('../config/firebase'); // Import the initialized Firebase Admin SDK
// for some reason this path isn't working :(
const db = admin.firestore(); // Get a Firestore instance

// Function to add a new recipe
addRecipe();
// Function to get all recipes
getAllRecipes();
// remember that we can't get all the data at once, we need a subset of the data

// Function to get a recipe by ID
getRecipeById(id);

// Export the functions to be used in other parts of the application
module.exports = {
  addRecipe,
  getAllRecipes,
  getRecipeById,
};

// next step: go to routes/recipes.js
// this will use the functions defined in this file to interact with Firestore