// backend/routes/recipes.js
const express = require('express');
const router = express.Router();
const { getRecipes, addRecipe } = require('../controllers/recipes');

// Endpoint to get recipes
router.get('/', getRecipes);

// Endpoint to add a new recipe
router.post('/', addRecipe);

module.exports = router;
