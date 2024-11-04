// backend/controllers/recipes.js
const recipes = []; // Temporary in-memory storage

// Get all recipes
const getRecipes = (req, res) => {
  res.json(recipes);
};

// Add a new recipe
const addRecipe = (req, res) => {
  const newRecipe = req.body;
  recipes.push(newRecipe);
  res.status(201).json(newRecipe);
};

module.exports = { getRecipes, addRecipe };
