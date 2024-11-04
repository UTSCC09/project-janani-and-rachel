// backend/routes/recipes.js
const express = require('express');
const router = express.Router();
const { addRecipe, getAllRecipes, getRecipeById } = require('../config/db.js'); // Corrected path

// Route to get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await getAllRecipes(); // Assume this returns a promise
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes' });
  }
});

// Route to add a new recipe
router.post('/', async (req, res) => {
  const newRecipe = req.body; // Expecting JSON body
  try {
    const addedRecipe = await addRecipe(newRecipe); // Assume this returns a promise
    res.status(201).json(addedRecipe);
  } catch (error) {
    res.status(500).json({ message: 'Error adding recipe' });
  }
});

// Route to get a recipe by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const recipe = await getRecipeById(id); // Assume this returns a promise
    if (recipe) {
      res.json(recipe);
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipe' });
  }
});

module.exports = router;
