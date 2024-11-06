// backend/routes/recipes.js
// this route is for real time sharing of recipes between users
// might need to import collection, getDocs from 'firebase/firestore/lite';
import express from 'express';
const router = express.Router();
export default router;

// Function to add a new recipe
export function addRecipe() {
  return;
};

// Function to get all recipes
export function getAllRecipes() {
  return;
};

// Function to get a recipe by ID
export function getRecipeById() {
  return;
};

// Route to get all recipes
router.get('/', async (req, res) => {
  try {
    // return an array of recipes (this is temporary data for testing)
    const recipes = [
      { id: 1, name: 'Pasta', ingredients: ['pasta', 'tomato sauce', 'cheese'] },
      { id: 2, name: 'Salad', ingredients: ['lettuce', 'tomato', 'cucumber'] },
      { id: 3, name: 'Pizza', ingredients: ['dough', 'tomato sauce', 'cheese', 'pepper'] },
    ];
    res.json(recipes);
    // return code 200
    res.status(200);

    // const recipes = await getAllRecipes(); // Assume this returns a promise
    // res.json(recipes);
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