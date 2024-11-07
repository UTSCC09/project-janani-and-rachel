// backend/routes/recipes.js
// this route is for real time sharing of recipes between users
// might need to import collection, getDocs from 'firebase/firestore/lite';
import express from 'express';
import recipeServices from '../../services/favRecipeServices'; 

export const router = express.Router();

// Route to get all favorited recipes
router.get('/', (req, res, next) => {
    recipeServices
        .getFavRecipes("Janani")
        .then((recipes) => {
            return res.status(200).json(recipes);
        });

});

// Route to get a recipe by ID
router.get('/:id', async (req, res) => {
});